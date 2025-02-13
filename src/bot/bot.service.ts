import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { Bot } from "./models/bot.models";
import { Context, Markup } from "telegraf";
import { Op } from "sequelize";
import { InlineKeyboardButton } from "telegraf/typings/core/types/typegram";
import { errorHandler } from "../helpers/error_handler";

@Injectable()
export class BotService {
  constructor(@InjectModel(Bot) private readonly botModel: typeof Bot) {}

  async deleteUnfinishedCars(ctx: Context) {
    try {
      const user_id = ctx.from?.id;
      const unfinishedCars = await this.botModel.findOne({
        where: { user_id, last_state: { [Op.ne]: "finish" } },
      });
      if (unfinishedCars) {
        await this.botModel.destroy({ where: { id: unfinishedCars.id } });
        ctx.reply("Avtomobil qo'shish jarayoni bekor qilindi");
      }
    } catch (error) {
      errorHandler(ctx, error, "deleteUnfinishedCars");
    }
  }

  async myCarsButtons(ctx: Context) {
    try {
      const user_id = ctx.from?.id;

      const cars = await this.botModel.findAll({
        where: { user_id, last_state: "finish" },
      });
      let inline_keyboard: InlineKeyboardButton[][] = [];
      cars.forEach((value) => {
        inline_keyboard.push([
          {
            text: `${value.model}: ${value.car_number}`,
            callback_data: `car_${value.id}`,
          },
        ]);
      });

      return inline_keyboard;
    } catch (error) {
      errorHandler(ctx, error, "myCarsButtons");
      let inline_keyboard: InlineKeyboardButton[][] = [];
      return inline_keyboard;
    }
  }

  async start(ctx: Context) {
    try {
      await this.deleteUnfinishedCars(ctx);
      ctx.replyWithHTML(
        "Assalomu alaykum <b>My Cars Bot</b>iga xush kelibsiz.🙂",
        Markup.keyboard([
          ["Mening avtomobillarim", "Avtomobil qo'shish"],
        ]).resize()
      );
    } catch (error) {
      errorHandler(ctx, error, "start");
    }
  }

  async help(ctx: Context) {
    try {
      await this.deleteUnfinishedCars(ctx);
      ctx.replyWithHTML(
        "<b>My Cars Bot</b> sizga o'zingizni avtomobillaringizni ro'yxatini saqlashga yordam beradi.\n\n<i>P.S: Ushbu bot o'quv mashg'uloti uchun qilindi🤓</i>"
      );
    } catch (error) {
      errorHandler(ctx, error, "help");
    }
  }

  async addCar(ctx: Context) {
    try {
      const user_id = ctx.from?.id;
      await this.deleteUnfinishedCars(ctx);

      const message = await ctx.reply(
        "Iltimos avtomobilingiz raqamini kiriting:"
      );
      await this.botModel.create({
        user_id,
        last_state: `car_number_${message.message_id}`,
      });
    } catch (error) {
      errorHandler(ctx, error, "addCar");
    }
  }

  async text(ctx: Context) {
    try {
      const user_id = ctx.from?.id;
      const car = await this.botModel.findOne({
        where: { user_id, last_state: { [Op.ne]: "finish" } },
      });

      if (/^car_number_\d+$/.test(car?.last_state || "")) {
        const message_id = car?.last_state.split("_")[2];
        car!.car_number = ctx.text;
        car!.last_state = `model_${message_id}`;
        await car!.save();

        ctx.deleteMessage();
        ctx.telegram.editMessageText(
          ctx.chat?.id,
          Number(message_id),
          undefined,
          `Avtomobil malumotlari:\n\nRaqam: ${car?.car_number}\n\nAvtomobil modelini kiriting:`
        );
      } else if (/^model_\d+$/.test(car?.last_state || "")) {
        const message_id = car?.last_state.split("_")[1];
        car!.model = ctx.text;
        car!.last_state = `color_${message_id}`;
        await car!.save();

        ctx.deleteMessage();
        ctx.telegram.editMessageText(
          ctx.chat?.id,
          Number(message_id),
          undefined,
          `Avtomobil malumotlari:\n\nRaqam: ${car?.car_number}\nModel: ${car?.model}\n\nAvtomobil rangini kiriting:`
        );
      } else if (/^color_\d+$/.test(car?.last_state || "")) {
        const message_id = car?.last_state.split("_")[1];
        car!.color = ctx.text;
        car!.last_state = `year_${message_id}`;
        await car!.save();

        ctx.deleteMessage();
        ctx.telegram.editMessageText(
          ctx.chat?.id,
          Number(message_id),
          undefined,
          `Avtomobil malumotlari:\n\nRaqam: ${car?.car_number}\nModel: ${car?.model}\nRang: ${car?.color}\n\nAvtomobilning ishlab chiqarilgan yilini kiriting:`
        );
      } else if (/^year_\d+$/.test(car?.last_state || "")) {
        const message_id = car?.last_state.split("_")[1];
        car!.year = ctx.text;
        car!.last_state = "finish";
        await car!.save();

        ctx.deleteMessage();
        ctx.telegram.editMessageText(
          ctx.chat?.id,
          Number(message_id),
          undefined,
          `Tabriklaymiz avtomobilingiz muvaffaqiyatli qo'shildi!\n\nRaqam: ${car?.car_number}\nModel: ${car?.model}\nRang:  ${car?.color}\nYil:   ${car?.year}`
        );
      } else if (/^editnumber_\d+$/.test(car?.last_state || "")) {
        const message_id = +car!.last_state?.split("_")[1];
        console.log(message_id);
        car!.car_number = ctx.text;
        car!.last_state = "finish";
        await car!.save();
        ctx.deleteMessage();
        ctx.telegram.editMessageText(
          ctx.chat?.id,
          message_id,
          undefined,
          `Avtomobil malumotlari:\n\nRaqam: ${car?.car_number}\nModel: ${car?.model}\nRang:  ${car?.color}\nYil:   ${car?.year}\n\nKerakli tahrirlashni tanlang:`,
          Markup.inlineKeyboard([
            [
              { text: "Raqam", callback_data: `editnumber_${car!.id}` },
              { text: "Model", callback_data: `editmodel_${car!.id}` },
            ],
            [
              { text: "Rang", callback_data: `editcolor_${car!.id}` },
              { text: "Yil", callback_data: `edityear_${car!.id}` },
            ],
            [{ text: "« Ortga", callback_data: `car_${car!.id}` }],
          ])
        );
      } else if (/^editmodel_\d+$/.test(car?.last_state || "")) {
        const message_id = +car!.last_state?.split("_")[1];
        car!.model = ctx.text;
        car!.last_state = "finish";
        await car!.save();
        ctx.deleteMessage();
        ctx.telegram.editMessageText(
          ctx.chat?.id,
          message_id,
          undefined,
          `Avtomobil malumotlari:\n\nRaqam: ${car?.car_number}\nModel: ${car?.model}\nRang:  ${car?.color}\nYil:   ${car?.year}\n\nKerakli tahrirlashni tanlang:`,
          Markup.inlineKeyboard([
            [
              { text: "Raqam", callback_data: `editnumber_${car!.id}` },
              { text: "Model", callback_data: `editmodel_${car!.id}` },
            ],
            [
              { text: "Rang", callback_data: `editcolor_${car!.id}` },
              { text: "Yil", callback_data: `edityear_${car!.id}` },
            ],
            [{ text: "« Ortga", callback_data: `car_${car!.id}` }],
          ])
        );
      } else if (/^editcolor_\d+$/.test(car?.last_state || "")) {
        const message_id = +car!.last_state?.split("_")[1];
        car!.color = ctx.text;
        car!.last_state = "finish";
        await car!.save();
        ctx.deleteMessage();
        ctx.telegram.editMessageText(
          ctx.chat?.id,
          message_id,
          undefined,
          `Avtomobil malumotlari:\n\nRaqam: ${car?.car_number}\nModel: ${car?.model}\nRang:  ${car?.color}\nYil:   ${car?.year}\n\nKerakli tahrirlashni tanlang:`,
          Markup.inlineKeyboard([
            [
              { text: "Raqam", callback_data: `editnumber_${car!.id}` },
              { text: "Model", callback_data: `editmodel_${car!.id}` },
            ],
            [
              { text: "Rang", callback_data: `editcolor_${car!.id}` },
              { text: "Yil", callback_data: `edityear_${car!.id}` },
            ],
            [{ text: "« Ortga", callback_data: `car_${car!.id}` }],
          ])
        );
      } else if (/^edityear_\d+$/.test(car?.last_state || "")) {
        const message_id = +car!.last_state?.split("_")[1];
        car!.year = ctx.text;
        car!.last_state = "finish";
        await car!.save();
        ctx.deleteMessage();
        ctx.telegram.editMessageText(
          ctx.chat?.id,
          message_id,
          undefined,
          `Avtomobil malumotlari:\n\nRaqam: ${car?.car_number}\nModel: ${car?.model}\nRang:  ${car?.color}\nYil:   ${car?.year}\n\nKerakli tahrirlashni tanlang:`,
          Markup.inlineKeyboard([
            [
              { text: "Raqam", callback_data: `editnumber_${car!.id}` },
              { text: "Model", callback_data: `editmodel_${car!.id}` },
            ],
            [
              { text: "Rang", callback_data: `editcolor_${car!.id}` },
              { text: "Yil", callback_data: `edityear_${car!.id}` },
            ],
            [{ text: "« Ortga", callback_data: `car_${car!.id}` }],
          ])
        );
      }
    } catch (error) {
      errorHandler(ctx, error, "text");
    }
  }

  async myCars(ctx: Context) {
    try {
      const inline_keyboard = await this.myCarsButtons(ctx);

      ctx.reply(
        "Sizning avtomobillaringiz:",
        Markup.inlineKeyboard(inline_keyboard)
      );
    } catch (error) {
      errorHandler(ctx, error, "myCars");
    }
  }

  async myCar(ctx: Context) {
    try {
      const id = ctx.callbackQuery!["data"].split("_")[1];
      const car = await this.botModel.findOne({ where: { id } });

      if (!car) {
        return ctx.reply("Avtomobil ro'yxatdan o'chirilgan");
      }

      ctx.editMessageText(
        `Avtomobil malumotlari:\n\nRaqam: ${car?.car_number}\nModel: ${car?.model}\nRang:  ${car?.color}\nYil:   ${car?.year}`,
        Markup.inlineKeyboard([
          [
            { text: "O'chirish", callback_data: `del_${car.id}` },
            { text: "Tahrirlash", callback_data: `edit_${car.id}` },
          ],
          [{ text: "« Ro'yxatga qaytish", callback_data: "mycars" }],
        ])
      );
    } catch (error) {
      errorHandler(ctx, error, "myCar");
    }
  }

  async myCarsPage(ctx: Context) {
    try {
      const inline_keyboard = await this.myCarsButtons(ctx);

      ctx.editMessageText(
        "Sizning avtomobillaringiz:",
        Markup.inlineKeyboard(inline_keyboard)
      );
    } catch (error) {
      errorHandler(ctx, error, "myCarsPage");
    }
  }

  async delCar(ctx: Context) {
    try {
      const id = ctx.callbackQuery!["data"].split("_")[1];
      await this.botModel.destroy({ where: { id } });

      ctx.editMessageText(
        `Avtomobil ro'yxatdan o'chirildi`,
        Markup.inlineKeyboard([
          [{ text: "« Ro'yxatga qaytish", callback_data: "mycars" }],
        ])
      );
    } catch (error) {
      errorHandler(ctx, error, "delCar");
    }
  }

  async editCar(ctx: Context) {
    try {
      const id = ctx.callbackQuery!["data"].split("_")[1];
      const car = await this.botModel.findOne({ where: { id } });

      if (!car) {
        return ctx.reply("Avtomobil ro'yxatdan o'chirilgan");
      }

      ctx.editMessageText(
        `Avtomobil malumotlari:\n\nRaqam: ${car?.car_number}\nModel: ${car?.model}\nRang:  ${car?.color}\nYil:   ${car?.year}\n\nKerakli tahrirlashni tanlang:`,
        Markup.inlineKeyboard([
          [
            { text: "Raqam", callback_data: `editnumber_${car.id}` },
            { text: "Model", callback_data: `editmodel_${car.id}` },
          ],
          [
            { text: "Rang", callback_data: `editcolor_${car.id}` },
            { text: "Yil", callback_data: `edityear_${car.id}` },
          ],
          [{ text: "« Ortga", callback_data: `car_${car.id}` }],
        ])
      );
    } catch (error) {
      errorHandler(ctx, error, "editCar");
    }
  }

  async editNumber(ctx: Context) {
    try {
      const id = ctx.callbackQuery!["data"].split("_")[1];
      const car = await this.botModel.findOne({ where: { id } });
      car!.last_state = `editnumber_${ctx.callbackQuery?.message?.message_id}`;
      await car?.save();
      ctx.editMessageText("Tahrirlash:\nAvtomobil raqamini kiriting:");
    } catch (error) {
      errorHandler(ctx, error, "editNumber");
    }
  }

  async editModel(ctx: Context) {
    try {
      const id = ctx.callbackQuery!["data"].split("_")[1];
      const car = await this.botModel.findOne({ where: { id } });
      car!.last_state = `editmodel_${ctx.callbackQuery?.message?.message_id}`;
      await car?.save();
      ctx.editMessageText("Tahrirlash:\nAvtomobil modelini kiriting:");
    } catch (error) {
      errorHandler(ctx, error, "editModel");
    }
  }

  async editColor(ctx: Context) {
    try {
      const id = ctx.callbackQuery!["data"].split("_")[1];
      const car = await this.botModel.findOne({ where: { id } });
      car!.last_state = `editcolor_${ctx.callbackQuery?.message?.message_id}`;
      await car?.save();
      ctx.editMessageText("Tahrirlash:\nAvtomobil rangini kiriting:");
    } catch (error) {
      errorHandler(ctx, error, "editColor");
    }
  }

  async editYear(ctx: Context) {
    try {
      const id = ctx.callbackQuery!["data"].split("_")[1];
      const car = await this.botModel.findOne({ where: { id } });
      car!.last_state = `edityear_${ctx.callbackQuery?.message?.message_id}`;
      await car?.save();
      ctx.editMessageText("Tahrirlash:\nAvtomobil yilini kiriting:");
    } catch (error) {
      errorHandler(ctx, error, "editYear");
    }
  }
}
