import { Entity, PrimaryKey, Property } from "@mikro-orm/core";

@Entity()
export class User {
  constructor(
    username: string,
    email: string,
    password: string,
    language: Language = "en"
  ) {
    this.username = username;
    this.email = email;
    this.password = password;
    this.language = language;
  }

  @PrimaryKey()
  id!: number;

  @Property({ type: "text" })
  username!: string;

  @Property({ type: "text", unique: true })
  email!: string;

  @Property({ type: "text", hidden: true })
  password!: string;

  @Property({ type: "date" })
  joined: Date = new Date();

  @Property({ type: "date", onUpdate: () => new Date() })
  updated: Date = new Date();

  @Property({ type: "text" })
  language!: Language;

  @Property({ type: "number" })
  rank: number = 1;

  @Property({ type: "text", nullable: true })
  avatar?: string;

  @Property({ type: "text", nullable: true })
  description?: string;
}
