export default function (dateString, locale="en-US") {
    const date = new Date(dateString);
    return date.toLocaleDateString(locale, {
        year: "numeric",
        month: "short",
        day: "numeric",
    });
  }