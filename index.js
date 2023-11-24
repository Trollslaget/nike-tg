const TelegramBot = require("node-telegram-bot-api");
const express = require("express");
const cors = require("cors");
const firebase = require("firebase");
require("firebase/storage");
const token = "6237501658:AAElqLHVDgMr0wnd-CaUq_2GUHm3zULJA_E";
const webAppUrl = "https://nike-eosin.vercel.app";

const bot = new TelegramBot(token, { polling: true });
const app = express();
const firebaseConfig = {
	apiKey: "AIzaSyA4Hs1Sui1k-QA2LLkzMTGeMD03kUhrixw",
	authDomain: "nike-parser.firebaseapp.com",
	databaseURL:
		"https://nike-parser-default-rtdb.europe-west1.firebasedatabase.app",
	projectId: "nike-parser",
	storageBucket: "nike-parser.appspot.com",
	messagingSenderId: "265110176866",
	appId: "1:265110176866:web:937fac1ad9aa3287827d3b",
};
firebase.initializeApp(firebaseConfig);
const db = firebase.database();
const storage = firebase.storage();

app.use(express.json());
app.use(cors());
bot.setMyCommands([{ command: "/start", description: "начать" }]);

bot.on("message", async (msg) => {
	const chatId = msg.chat.id;
	const text = msg.text;
	let dbRef = db.ref("items");
	let products;
	await dbRef.once("value", function (snapshot) {
		products = snapshot.val();
	});
	function findProductById(itemSKU) {
		return products.items.find((product) => product.itemSKU === itemSKU);
	}
	if  (text && text.startsWith("/search")) {
		// Извлекаем itemId из команды
		const itemIdToSearch = text.split(" ");

		const foundProduct = findProductById(
			itemIdToSearch[itemIdToSearch.length - 1]
		);
		if (foundProduct) {
			bot.sendMessage(
				chatId,
				`Найден продукт: ${foundProduct.itemOriginalLink}`
			);
		} else {
			bot.sendMessage(chatId, `Продукт не найден ${itemIdToSearch}`);
		}
	}
	if (text === "/start") {
		await bot.sendMessage(
			chatId,
			"Нажми на кнопку ниже, чтобы посмотреть товары!",
			{
				reply_markup: {
					keyboard: [
						[{ text: "Открыть каталог", web_app: { url: webAppUrl } }],
					],
				},
			}
		);
	}
	if (msg && msg.web_app_data && msg.web_app_data.data) {
		try {
			const data = JSON.parse(msg.web_app_data.data);
			await bot.sendPhoto(chatId, data.itemImage, {
				caption: `Ваш товар: ${data.itemText}\nВыбранный размер: ${data.itemSize}\nЦена: ${data.itemPrice} ₽\nАртикул товара:  <code>${data.itemSKU}</code> \nДля заказа напишите менеджеру @berlinsilencer артикул и размер, или перешлите ему это сообщение`,
				parse_mode: "HTML",
			});
		} catch (e) {
			console.log(e);
		}
	}
});
const PORT = 8000;

app.listen(PORT, () => console.log("server started on PORT " + PORT));
