import { Context } from "telegraf";

export const errorHandler = (ctx: Context, error: Error, name: string) => {
  ctx.reply("Botda texnik nosozlik kuzatildi!");
  ctx.telegram.sendMessage(
    process.env.ADMIN_ID || 5751130518,
    `Botda xatolik yuzaga keldi\nFunction name:${name}\nError message: ${error.message}`
  );
  console.log(error);
};
