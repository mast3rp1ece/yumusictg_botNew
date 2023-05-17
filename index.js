const { Telegraf, Markup } = require('telegraf');
const { message } = require('telegraf/filters');
require('dotenv').config()
const text = require('./const')
const fs = require('fs');
const path = require('path');
const cron = require('node-cron');

const bot = new Telegraf(process.env.BOT_TOKEN);

const filePath = path.join(__dirname, 'chat_ids.txt');

// Функція для додавання нового chat_id до файлу
function saveChatId(chatId) {
  fs.appendFileSync(filePath, chatId + '\n', 'utf8');
}

// Функція для отримання збережених chat_id з файлу
function getSavedChatIds() {
  const data = fs.readFileSync(filePath, 'utf8');
  const chatIds = data.trim().split('\n');
  return chatIds;
}

// Функція для отримання збережених chat_id з файлу
function getSavedChatIds() {
	const data = fs.readFileSync(filePath, 'utf8');
	const chatIds = data.trim().split('\n');
	return chatIds;
 }
 
 // Функція для надсилання повідомлення всім користувачам
 async function sendMessageToAllUsers(message) {
	const chatIds = getSavedChatIds();
	for (const chatId of chatIds) {
	  try {
		 await bot.telegram.sendMessage(chatId, message);
	  } catch (error) {
		 console.error(`Помилка при надсиланні повідомлення користувачу з chat_id ${chatId}:`, error);
	  }
	}
 }
 
 // Виклик функції для надсилання повідомлення всім користувачам
//  sendMessageToAllUsers('Хай');

bot.command('start', (ctx) => {
	ctx.reply(`Привіт ${ctx.message.from.first_name ? ctx.message.from.first_name : 'Друже'}👋 Я створив цього бота, щоб ви не забували сплачувати щомісячний платіж на підписку "Youtube Music"😉`, {
		 reply_markup: {
			  keyboard: [
				['💰Оплата']
			],
			  resize_keyboard: true
		 }
	});
	console.log(ctx.message)
	const chatId = ctx.message.chat.id;
	saveChatId(chatId); // Збереження chat_id
});

bot.hears('💰Оплата', async (ctx) => {
	try {
		await ctx.replyWithHTML('<b>💳Оплата</b>', Markup.inlineKeyboard(
			[
				[Markup.button.callback('⚫️Mono⚫️', 'btn_1'), Markup.button.callback('🟡Raiffeisen🟡', 'btn_2')],
				[Markup.button.callback("🆘Зв'язатися зі мною🆘", 'btn_3')]
			]
		))
	} catch (e) {
		console.error(e)
	}
})

bot.help((ctx) => ctx.reply(text.commands));

bot.command('payment', async (ctx)=> {
	try {
		await ctx.replyWithHTML('<b>Оплата</b>', Markup.inlineKeyboard(
			[
				[Markup.button.callback('Mono', 'btn_1'), Markup.button.callback('Raiffeisen', 'btn_2')],
				[Markup.button.callback("Зв'язатися зі мною", 'btn_3')]
			]
		))
	} catch (e) {
		console.error(e)
	}
})

bot.on(message('text'), async (ctx) => {
	await ctx.replyWithHTML(`${ctx.message.from.first_name ? ctx.message.from.first_name : 'Друже'}, я тебе не зрозумів🥺 Будь ласка обери конкретну дію😃`);
 })

function addActionBot(name, src, text) {
	bot.action(name, async (ctx) => {
		try {
			await ctx.answerCbQuery()
			if (src !== false) {
				await ctx.replyWithPhoto({
					source: src
				})
			}
			await ctx.replyWithHTML(text, {
				disable_web_page_preview: true
			})
		}catch (e) {
			console.error(e)
		}
	})
}
addActionBot('btn_1', false, text.mono)
addActionBot('btn_2', false, text.raiff)
addActionBot('btn_3', false, text.contact)
// Функція для надсилання щомісячного повідомлення
async function sendMonthlyMessage(chatId) {
  try {
    const chatMember = await bot.telegram.getChatMember(chatId, chatId);
    if (chatMember.status !== 'left' && chatMember.status !== 'kicked') {
      const message = 'Привіт👋, це щомісячне нагадування про оплату користуванням "Youtube Misuc" у розмірі - "20грн"🤑';
      await bot.telegram.sendMessage(chatId, message);
    }
  } catch (error) {
    console.error(`Помилка при надсиланні повідомлення користувачу з chat_id ${chatId}:`, error);
  }
}
 
 // Функція для надсилання щомісячного повідомлення всім користувачам
function sendMonthlyMessagesToAllUsers() {
	fs.readFile("chat_ids.txt", "utf-8", (err, data) => {
	  if (err) throw err;
	  const chatIds = data.split("\n");
	  for (const chatId of chatIds) {
	  const trimmedChatId = chatId.trim();
      if (trimmedChatId !== '') {
        sendMonthlyMessage(trimmedChatId);
		}
	  }
	});
}

cron.schedule("10 0 18 * *", () => {
	sendMonthlyMessagesToAllUsers();
});

bot.launch();

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));