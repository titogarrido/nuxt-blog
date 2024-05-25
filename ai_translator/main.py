import ollama

fp=open('../content/blog/terraform-and-kvm.md')

text=fp.read()

response = ollama.chat(model='llama3', messages=[
  {
    'role': 'user',
    'content': 'translate the following markdown content to portuguese, avoid translating anything related to commands ou output of commands. Put just the translation, do not be verbose:\n\n' + text,
  },
])
print(response['message']['content'])