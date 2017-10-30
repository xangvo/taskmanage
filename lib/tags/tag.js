// Class that represents a tag
export default class Tag {
  constructor(textTag, title, link, type) {
    // The textTag property is the text representation of the tag (like #my-tag)
    this.textTag = textTag;
    // The title of the tag for display purpose
    this.title = title;
    // The link associated with this tag
    this.link = link;
    // The type of the tag as a string
    this.type = type;
  }
}
