---
title: Terraform and KVM (x86)
published: 2019-05-22
tags: terraform,kvm,cloud
---

[Terraform](terraform.io) is what they call "Infrastructure as a code". It has a different approach from other automation tools like Puppet, Chef or Ansible because it is focused on Cloud Infrastructure.

It supports a bunch of [providers](https://www.terraform.io/docs/providers/index.html) like AWS, Azure, Softlayer... but, as you can see, there is no official support for KVM. I don't want to create a AWS account just to try terraform, so in this article I am going to write step by step how to create a KVM virtual environment using [Terraform libvirt provider](https://github.com/dmacvicar/terraform-provider-libvirt).

---
**Update:** 

**05/22/2019** - This article has been updated to support Terraform 0.11.14 and libvirt provider 0.5.1.

---

## Pre-requisites
- x86 server
- Ubuntu 16.04 or 18.04
- KVM installed and configured
- Some disk space for your guests

### APT pre-requisites

```bash
# apt install unzip git libvirt-dev
```

## Installing Terraform

First find the appropriate package for Linux on [Terraform Download page](https://www.terraform.io/downloads.html).

I am using [https://releases.hashicorp.com/terraform/0.11.14/terraform_0.11.14_linux_amd64.zip](https://releases.hashicorp.com/terraform/0.11.14/terraform_0.11.14_linux_amd64.zip) that is the latest version available to me.

```bash
wget https://releases.hashicorp.com/terraform/0.11.14/terraform_0.11.14_linux_amd64.zip

```

Unzip it, it is just a binary that we will move to _/usr/local/bin_ :

```bash
root@ubuntu-host:~# unzip terraform_0.11.14_linux_amd64.zip
Archive:  terraform_0.11.14_linux_amd64.zip
  inflating: terraform
```
```bash
root@ubuntu-host:~# chmod +x terraform
root@ubuntu-host:~# mv terraform /usr/local/bin/
```

Verifying the Installation 

```bash
root@ubuntu-host:~$ terraform
Usage: terraform [-version] [-help] <command> [args]

The available commands for execution are listed below.
The most common, useful commands are shown first, followed by
less common or more advanced commands. If you're just getting
started with Terraform, stick with the common commands. For the
other commands, please read the help and docs before usage.

Common commands:
    apply              Builds or changes infrastructure
    console            Interactive console for Terraform interpolations
    destroy            Destroy Terraform-managed infrastructure
    env                Workspace management
    fmt                Rewrites config files to canonical format
    get                Download and install modules for the configuration
    graph              Create a visual graph of Terraform resources
    import             Import existing infrastructure into Terraform
    init               Initialize a Terraform working directory
    output             Read an output from a state file
    plan               Generate and show an execution plan
    providers          Prints a tree of the providers used in the configuration
    push               Upload this Terraform module to Atlas to run
    refresh            Update local state file against real resources
    show               Inspect Terraform state or plan
    taint              Manually mark a resource for recreation
    untaint            Manually unmark a resource as tainted
    validate           Validates the Terraform files
    version            Prints the Terraform version
    workspace          Workspace management

All other commands:
    0.12checklist      Checks whether the configuration is ready for Terraform v0.12
    debug              Debug output management (experimental)
    force-unlock       Manually unlock the terraform state
    state              Advanced state management
```

Next step, install libvirt provider!

## Installing Terraform libvirt Provider

If you want to build the latest version the libvirt provide will require:
- libvirt 1.2.14 or newer
- latest golang version
- mkisofs is required to use the CloudInit feature.

### Installing golang 1.9

To get the latest version of golang we are going to use a ppa:

```bash
sudo add-apt-repository ppa:gophers/archive
```

Update the repositories:

```bash
apt-get update
```

Remove an old version of golang:

```bash
apt remove golang
apt autoremove
```

```bash
apt-get install golang-1.9-go
```

Add golang 1.9 to your PATH, create a file on _/etc/profile.d_: 

```bash
vim /etc/profile.d/golang19.sh
```

Copy this content:

```bash
#!/bin/bash

if [ -d "/usr/lib/go-1.9/bin" ] ; then
   export PATH="$PATH:/usr/lib/go-1.9/bin"
fi
```

Set your GOPATH, add the content above to your _.bashrc_:

```bash
export GOPATH=$HOME/go
```

Logon with your user again (I am using root) and test the installation:

```bash
root@ubuntu-host:~# go version
go version go1.9.4 linux/amd64
```

### Building libvirt provider

Use "go get" to download the source from github:

```bash
root@ubuntu-host:~# go get github.com/dmacvicar/terraform-provider-libvirt
root@ubuntu-host:~# go install github.com/dmacvicar/terraform-provider-libvirt
```

You will now find the binary at $GOPATH/bin/terraform-provider-libvirt

### Moving the libvirt provider to terraform.d

There is a directory called "_terraform.d_" in your $HOME. In my example it is located in _/root/.terraform.d_

If .terraform.d is not present execute a command and terraform will create it for you, example:

```bash
root@ubuntu-host:~# terraform init
Terraform initialized in an empty directory!

The directory has no Terraform configuration files. You may begin working
with Terraform immediately by creating Terraform configuration files.
root@ubuntu-host:~# cd .terraform.d/
root@ubuntu-host:~/.terraform.d# ls
checkpoint_signature
```

We are going to create a folder called "_plugins_" there:

```bash
root@ubuntu-host:~/.terraform.d# mkdir plugins
root@ubuntu-host:~/.terraform.d# cd plugins/
root@ubuntu-host:~/.terraform.d/plugins# pwd
/root/.terraform.d/plugins
```

Copy our plugin binary to this new directory:

```bash
root@ubuntu-host:~/.terraform.d/plugins# cp ~/go/bin/terraform-provider-libvirt .
root@ubuntu-host:~/.terraform.d/plugins# ls -alh
total 31M
drwxr-xr-x 2 root root 4.0K Feb 26 13:09 .
drwxr-xr-x 3 root root 4.0K Feb 26 13:09 ..
-rwxr-xr-x 1 root root  31M Feb 26 13:09 terraform-provider-libvirt
```

We should now be able to create a environment on KVM using Terraform, check the next session.

## Creating a Terraform configuration file for KVM

With Terraform installed, let's dive right into it and start creating some infrastructure. Create a new directory called "terraform", we will use this directory to store some configurations files of our project.

```bash
root@ubuntu-host:~/terraform# mkdir terraform
root@ubuntu-host:~/terraform# pwd
/root/terraform
```

We'll build infrastructure on KVM. Our configuration file will create a NAT network, a new volume and install Ubuntu 16.04 using a cloud image from Canonical servers.

Create a new file called "libvirt.tf" and copy the content below. The format of the configuration files is [documented here](https://www.terraform.io/docs/configuration/index.html).


```bash
# instance the provider
provider "libvirt" {
  uri = "qemu:///system"
}

# We fetch the latest ubuntu release image from their mirrors
resource "libvirt_volume" "ubuntu-qcow2" {
  name = "ubuntu-qcow2"
  pool = "images" #CHANGE_ME
  source = "https://cloud-images.ubuntu.com/releases/xenial/release/ubuntu-16.04-server-cloudimg-amd64-disk1.img"
  format = "qcow2"
}

# Create a network for our VMs
resource "libvirt_network" "vm_network" {
   name = "vm_network"
   addresses = ["10.0.1.0/24"]
   dhcp {
	enabled = true
   }
}

# Use CloudInit to add our ssh-key to the instance
resource "libvirt_cloudinit_disk" "commoninit" {
          name = "commoninit.iso"
          pool = "images" #CHANGEME
          user_data = "${data.template_file.user_data.rendered}"
          network_config = "${data.template_file.network_config.rendered}"
        }

data "template_file" "user_data" {
  template = "${file("${path.module}/cloud_init.cfg")}"
}

data "template_file" "network_config" {
  template = "${file("${path.module}/network_config.cfg")}"
}


# Create the machine
resource "libvirt_domain" "domain-ubuntu" {
  name = "ubuntu-terraform"
  memory = "512"
  vcpu = 1

  cloudinit = "${libvirt_cloudinit_disk.commoninit.id}"

  network_interface {
    network_id = "${libvirt_network.vm_network.id}"
    network_name = "vm_network"
  }

  # IMPORTANT
  # Ubuntu can hang is a isa-serial is not present at boot time.
  # If you find your CPU 100% and never is available this is why
  console {
    type        = "pty"
    target_port = "0"
    target_type = "serial"
  }

  console {
      type        = "pty"
      target_type = "virtio"
      target_port = "1"
  }

  disk {
       volume_id = "${libvirt_volume.ubuntu-qcow2.id}"
  }
  graphics {
    type = "spice"
    listen_type = "address"
    autoport = "true"
  }
}
```

The _provider_ block is used to configure the named provider, in our case "libvirt". If you want to connect to a remote KVM host you can change the uri to something like:
```bash
provider "libvirt" {
  uri = "virsh -c qemu+ssh://ubuntu@yourhostname.com/system?socket=/var/run/libvirt/libvirt-sock"
}
```
Make sure that the user _ubuntu_, for example, has the proper permission to execute _virsh_ commands.

The _resource_ block defines a resource that exists within the infrastructure. We have defined:

- _libvirt_volume_ that is a qcow2 disk that will be created inside our storage pool called "_images_" (**Note**: KVM creates a storage pool called "_default_" during the installation, this example uses "_images_" as a storage pool, change to your storage pool accordingly.)
- _libvirt_network_ will create a NAT network called "_vm_network_" using network "10.0.1.0/24" for DHCP.
- _libvirt_domain_ defines our guest "ubuntu-terraform" with 512MB of RAM, 1 vcpu, with a network interface and our qcow disk created on "_libvirt_volume_" resource.
- There are 2 templates files that we will need to create for _cloudinit_. They will define our user data and network interface information.

For the _user data_ we will create a file called `cloud_init.cfg` and paste the content below:

```bash
#cloud-config
users:
  - name: ubuntu
    sudo: ALL=(ALL) NOPASSWD:ALL
    groups: users, admin
    home: /home/ubuntu
    shell: /bin/bash
    ssh-authorized-keys:
      - ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQDYnZmg #CHANGE_ME
ssh_pwauth: True
disable_root: false
chpasswd:
  list: |
     ubuntu:linux
  expire: False
package_update: true
packages:
    - qemu-guest-agent
growpart:
  mode: auto
  devices: ['/']
```

(All available parameters for cloudinit can be [found here](https://cloudinit.readthedocs.io/en/latest/topics/modules.html "Cloudinit parameters"))

- The configuration above creates an user called _ubuntu_ that will have SUDO access without password, an authorized key for passwordless access (**Note**: change it to your id_rsa.pub), it will also allow password access and the default password is _linux_.

- The _package_ section will install _qemu-guest-agent_ package to provide us some facilities managing our VM. 

- The _growpart_ statement resizes partitions to fill the available disk space.

```bash
ubuntu@ubuntu-host:~/terraform/blogtest$ ls
cloud_init.cfg  libvirt.tf
````

Now we will create our last configuration file that will setup our network card, it will be called `network_config.cfg`. Paste the content below:

```bash
version: 2
ethernets:
  ens3:
     dhcp4: true
```

(All available parameters for cloudinit network file can be [found here](https://cloudinit.readthedocs.io/en/latest/topics/network-config-format-v2.html#network-config-v2 "Cloudinit network parameters"))

- It is a simple file that will create a interface called _ens3_ and setup as DHCP client.

Now we have all the 3 files that we need in our _terraform_ folder:

```bash
ubuntu@ubuntu-host:~/terraform/blogtest$ ls
cloud_init.cfg  libvirt.tf  network_config.cfg
```


## Initialization

The first command to run for a new configuration -- or after checking out an existing configuration from version control -- is _terraform init_, which initializes various local settings and data that will be used by subsequent commands.

```bash
root@ubuntu-host:~/terraform# terraform init

Initializing provider plugins...

Terraform has been successfully initialized!

You may now begin working with Terraform. Try running "terraform plan" to see
any changes that are required for your infrastructure. All Terraform commands
should now work.

If you ever set or change modules or backend configuration for Terraform,
rerun this command to reinitialize your working directory. If you forget, other
commands will detect it and remind you to do so if necessary.
```

## Apply Changes

In the same directory as the libvirt.tf file you created, run _terraform apply_. You should see output similar to below, though we've truncated some of the output to save space:

```bash
root@ubuntu-host:~/terraform# terraform apply

An execution plan has been generated and is shown below.
Resource actions are indicated with the following symbols:
  + create

Terraform will perform the following actions:

  + libvirt_cloudinit.commoninit
      id:                               <computed>
      name:                             "commoninit.iso"
      pool:                             "images"
      ssh_authorized_key:               "ssh-rsa AAAAB3NzaC1yc2[...]"

  + libvirt_domain.domain-ubuntu
      id:                               <computed>
      arch:                             <computed>
      cloudinit:                        "${libvirt_cloudinit.commoninit.id}"
      console.#:                        "2"
      console.0.target_port:            "0"
      console.0.target_type:            "serial"
      console.0.type:                   "pty"
      console.1.target_port:            "1"
      console.1.target_type:            "virtio"
      console.1.type:                   "pty"
      disk.#:                           "1"
      disk.0.scsi:                      "false"
      disk.0.volume_id:                 "${libvirt_volume.ubuntu-qcow2.id}"
      emulator:                         <computed>
      graphics.#:                       "1"
      graphics.0.autoport:              "true"
      graphics.0.listen_type:           "address"
      graphics.0.type:                  "spice"
      machine:                          <computed>
      memory:                           "512"
      name:                             "ubuntu-terraform"
      network_interface.#:              "1"
      network_interface.0.addresses.#:  <computed>
      network_interface.0.hostname:     "master"
      network_interface.0.mac:          <computed>
      network_interface.0.network_id:   <computed>
      network_interface.0.network_name: "vm_network"
      vcpu:                             "1"

  + libvirt_network.vm_network
      id:                               <computed>
      addresses.#:                      "1"
      addresses.0:                      "10.0.1.0/24"
      bridge:                           <computed>
      mode:                             "nat"
      name:                             "vm_network"

  + libvirt_volume.ubuntu-qcow2
      id:                               <computed>
      format:                           "qcow2"
      name:                             "ubuntu-qcow2"
      pool:                             "images"
      size:                             <computed>
      source:                           "https://cloud-images.ubuntu.com/releases/xenial/release/ubuntu-16.04-server-cloudimg-amd64-disk1.img"


Plan: 4 to add, 0 to change, 0 to destroy.

Do you want to perform these actions?
  Terraform will perform the actions described above.
  Only 'yes' will be accepted to approve.

  Enter a value:
```

This output shows the execution plan, describing which actions Terraform will take in order to change real infrastructure to match the configuration.

Now confirm these actions typing "_yes_" and wait for your new server.

At the end you are going to see an output like this one:

```bash
libvirt_domain.domain-ubuntu: Creation complete after 33s (ID: f6905a4e-993f-488e-a933-f74ce982f2a4)

Apply complete! Resources: 4 added, 0 changed, 0 destroyed.

Outputs:

ip = 10.0.1.166
```

## Check your new infrastructure

You can inspect the current state using terraform show:

```bash
root@ubuntu-host:~/terraform# terraform show
libvirt_cloudinit.commoninit:
  id = /var/lib/libvirt/images/commoninit.iso;5a9439b5-51c2-de45-f646-9a4c0dcd640f
  local_hostname =
  name = commoninit.iso
  pool = images
  ssh_authorized_key = ssh-rsa AAAAB3NzaC1[...]
  user_data = #cloud-config
ssh_authorized_keys:
- ssh-rsa AAAAB3NzaC1[...]

libvirt_domain.domain-ubuntu:
  id = f6905a4e-993f-488e-a933-f74ce982f2a4
  arch = x86_64
  autostart = false
  cloudinit = /var/lib/libvirt/images/commoninit.iso;5a9439b5-51c2-de45-f646-9a4c0dcd640f
  cmdline.# = 0
  console.# = 2
  console.0.source_path =
  console.0.target_port = 0
  console.0.target_type = serial
  console.0.type = pty
  console.1.source_path =
  console.1.target_port = 1
  console.1.target_type = virtio
  console.1.type = pty
  disk.# = 1
  disk.0.file =
  disk.0.scsi = false
  disk.0.url =
  disk.0.volume_id = /var/lib/libvirt/images/ubuntu-qcow2
  disk.0.wwn =
  emulator = /usr/bin/kvm-spice
  firmware =
  graphics.# = 1
  graphics.0.autoport = true
  graphics.0.listen_type = address
  graphics.0.type = spice
  initrd =
  kernel =
  machine = ubuntu
  memory = 512
  name = ubuntu-terraform
  network_interface.# = 1
  network_interface.0.addresses.# = 1
  network_interface.0.addresses.0 = 10.0.1.166
  network_interface.0.bridge =
  network_interface.0.hostname =
  network_interface.0.mac = DE:E8:A7:F1:D0:77
  network_interface.0.macvtap =
  network_interface.0.network_id = 6ec048ad-3e33-4080-bf19-f109fe1c5f27
  network_interface.0.network_name = vm_network
  network_interface.0.passthrough =
  network_interface.0.vepa =
  network_interface.0.wait_for_lease = false
  nvram.# = 0
  vcpu = 1
libvirt_network.vm_network:
  id = 6ec048ad-3e33-4080-bf19-f109fe1c5f27
  addresses.# = 1
  addresses.0 = 10.0.1.0/24
  autostart = false
  bridge = virbr1
  mode = nat
  name = vm_network
libvirt_volume.ubuntu-qcow2:
  id = /var/lib/libvirt/images/ubuntu-qcow2
  format = qcow2
  name = ubuntu-qcow2
  pool = images
  size = 2361393152
  source = https://cloud-images.ubuntu.com/releases/xenial/release/ubuntu-16.04-server-cloudimg-amd64-disk1.img


Outputs:

ip = 10.0.1.166
```

You can see that by creating our resource, we've also gathered a lot of information about it. As you can see my server got the NAT IP 10.0.1.166.

Check your KVM host to see what happened:

```bash
root@ubuntu-host:~/terraform# virsh list
 Id    Name                           State
----------------------------------------------------
 13    ubuntu-terraform               running

root@ubuntu-host:~/terraform# virsh net-list
 Name                 State      Autostart     Persistent
----------------------------------------------------------
 br0                  active     yes           yes
 default              active     yes           yes
 vm_network           active     no            yes
 ```

Access your new server:

```bash
ssh ubuntu@10.0.1.166
```

It shouldn't ask a password because we have setup ssh authorized keys.
 
 And that is it! Enjoy your new server, play with Terraform configuration file and try to increase the number of guests, networks and disks!
 
 On a next article I will try to build a Kubernetes environment on KVM using Terraform!
 
 See ya!