import {
  Action,
  Command,
  Ctx,
  Hears,
  Help,
  On,
  Start,
  Update,
} from "nestjs-telegraf";
import { BotService } from "./bot.service";
import { Context } from "telegraf";

@Update()
export class BotUpdate {
  constructor(private readonly botService: BotService) {}

  @Start()
  async onStart(@Ctx() ctx: Context) {
    await this.botService.start(ctx);
  }

  @Help()
  async onHelp(@Ctx() ctx: Context) {
    await this.botService.help(ctx);
  }

  @Hears("Avtomobil qo'shish")
  async onAddCar(@Ctx() ctx: Context) {
    await this.botService.addCar(ctx);
  }

  @Hears("Mening avtomobillarim")
  async onMyCars(@Ctx() ctx: Context) {
    await this.botService.myCars(ctx);
  }

  @Action(/^car_\d+$/)
  async onMyCar(@Ctx() ctx: Context) {
    await this.botService.myCar(ctx);
  }

  @Action(/^del_\d+$/)
  async delCar(@Ctx() ctx: Context) {
    await this.botService.delCar(ctx);
  }

  @Action(/^edit_\d+$/)
  async editCar(@Ctx() ctx: Context) {
    await this.botService.editCar(ctx);
  }

  @Action("mycars")
  async myCars(@Ctx() ctx: Context) {
    await this.botService.myCarsPage(ctx);
  }

  @Action(/^editnumber_\d+$/)
  async editNumber(@Ctx() ctx: Context) {
    await this.botService.editNumber(ctx);
  }

  @Action(/^editmodel_\d+$/)
  async editModel(@Ctx() ctx: Context) {
    await this.botService.editModel(ctx);
  }

  @Action(/^editcolor_\d+$/)
  async editColor(@Ctx() ctx: Context) {
    await this.botService.editColor(ctx);
  }

  @Action(/^edityear_\d+$/)
  async editYear(@Ctx() ctx: Context) {
    await this.botService.editYear(ctx);
  }

  @Command("setwebhook")
  async setWebhook(ctx: Context) {
    await this.botService.setWebhook(ctx);
  }

  @On("text")
  async onText(@Ctx() ctx: Context) {
    await this.botService.text(ctx);
  }
}
