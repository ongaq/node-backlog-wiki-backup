const config = require('./env');
const axios = require('axios');
const fs = require('fs');
const makeDir = require('make-dir');

// 全Wikiリストを取得し、Callbackを実行する
const mainTask = (async (eachWikiFunc) => {
	const wikiList = `${config.ENDPOINT}/wikis?projectIdOrKey=${config.PROJECT_ID}&apiKey=${config.API_KEY}`;

	try {
		const item = await axios.get(wikiList);
		item.data.forEach((wiki, i) => setTimeout(getEachWiki, i*1000, wiki, eachWikiFunc));
	} catch (err) {
		console.error(err);
	}
})(saveWiki);

// 各Wikiページを取得し、Callbackを実行する
async function getEachWiki(wiki, eachWikiFunc){
	const page = `${config.ENDPOINT}/wikis/${wiki.id}?apiKey=${config.API_KEY}`;

	try {
		const item = await axios.get(page);
		eachWikiFunc(item.data);
	} catch (err) {
		console.error(err);
	}
}
// 添付ファイルがある場合は合わせて取得する
function getAttachment(wiki, dirPath){
	wiki.attachments.forEach((body, i) => {
		setTimeout(async () => {
			const imageUrl = `${config.ENDPOINT}/wikis/${wiki.id}/attachments/${body.id}?apiKey=${config.API_KEY}`;
			try {
				const image = await axios.get(imageUrl, { responseType: 'arraybuffer' });
				fs.writeFileSync(`${dirPath}/${body.name}`, new Buffer(image.data), 'binary');
			} catch (err) {
				console.error(err);
			}
		}, i*1000);
	});
}
// ページ名でディレクトリを作成し、その中にページを格納する
function createDirectoryAndPages(fileName, contents, wiki){
	makeDir(fileName).then(dirPath => {
		fs.writeFileSync(`${dirPath}/${fileName}.md`, contents);
		if (wiki.attachments.length) {
			getAttachment(wiki, dirPath);
		}
	});
}
// 名前と内容を変換したwikiデータを保存する
function saveWiki(wiki){
	const fileName = convertFileName(wiki.name);
	
	createDirectoryAndPages(fileName, convertContent(wiki), wiki);
	console.log(`Save wiki: ${fileName}.md`);
}
// ファイル名に使えない文字列を置換する
function convertFileName(name){
	return name.
		replace(/\\/g, '￥').
		replace(/\//g, '／').
		replace(/\*/g, '＊').
		replace(/\"/g, '”').
		replace(/\?/g, '？').
		replace(/\|/g, '｜').
		replace(/:/g,  '：').
		replace(/</g,  '＜').
		replace(/>/g,  '＞');
}
// Backlogの書式を置換する
function convertContent(wiki){
	return (convertImagePath(wiki) || wiki.content).
		replace(/%%/g, '~~').
		replace(/\*/g, '#').
		replace(/\r/g, '').
		replace(/\n/g, '  \n');
}
// 書式内部の画像パス(id)をファイル名に置換する
function convertImagePath(wiki){
	if (!wiki.attachments.length) {
		return false;
	}

	let content = wiki.content;
	wiki.attachments.forEach((body, i) => {
		content = content.replace(body.id, body.name);
	});
	return content;
}