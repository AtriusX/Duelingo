import { Migration } from '@mikro-orm/migrations';

export class Migration20210709222504 extends Migration {

  async up(): Promise<void> {
    this.addSql('create table "user" ("id" serial primary key, "display_name" text not null, "email" text not null, "password" text not null, "joined" timestamptz(0) not null, "updated" text not null, "language" text not null, "rank" text not null default \'D\');');
    this.addSql('alter table "user" add constraint "user_email_unique" unique ("email");');
  }

}
