# node-backlog-wiki-backup
Node.jsでBacklog(nulab)のwikiを添付ファイル含めバックアップする。  
書式を変更せずバックアップ目的のみであれば`convertContent()`や`convertImagePath()`をよしなにコメントアウトする事。

## use
Node.js v9.10.1

## env.js (require)
```js
module.exports = {
	API_KEY: 'XXXXXX',
	ENDPOINT: 'https://XXXXXX.backlog.jp/api/v2',
	PROJECT_ID: '0000000000'
};
```