import { Module } from "@nestjs/common";
import { BotService } from "./bot.service";
import { BotUpdate } from "./bot.update";
import { SequelizeModule } from "@nestjs/sequelize";
import { Bot } from "./models/bot.models";

@Module({
  imports: [SequelizeModule.forFeature([Bot])],
  providers: [BotService, BotUpdate],
})
export class BotModule {}
