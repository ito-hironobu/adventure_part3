Cocos2d-JS アドベンチャーパートエンジン
====

このプロジェクトは Cocos2d-JS で動作する簡易アドベンチャーエンジンです。同一フォルダ以下の assets/resources/dataJson.json のシナリオを読み込んで動作します。
世界中のゲームのアドベンチャーパートで使われるように鋭意アップデート中です！

## 説明

Cocos2d-JS で動作するアドベンチャパートです。

## デモ

https://ito-hironobu.github.io/adventure_part3/

## 動作環境

cocos2d-x ver.3.8.0 以上

## 使用方法

githubからクローンしたassets/resources/dataJson.jsonファイル内を書き換えて動かしてください。

| character | キャラの定義です |
| --- | --- |
| no | story内のcharacter_noで使用するキャラ番号を設定します。 |
| url | 読み込む画像を指定します。ネット上の画像ならそのurlを"http://.../abc.png"のように指定します。assets/resourcesフォルダ内の画像なら"resources/abc.png"のように指定します。 |

| story | ストーリー内容の指定です |
| --- | --- |
| scenario |  |
| character_no | 表示させたいキャラクターの番号を指定してください。 |
| talk | キャラクターの話す内容を記述してください。 |
| node_no | ブラウザ上のどの位置にキャラクターを表示させるかを指定します。ブラウザ上には、( 1 4 2 5 3 )のように番号が振ってあるので、表示させたい位置の番号を指定してください。 |

## インストール

[cocos2d-x](http://www.cocos2d-x.org/download)  
クローン　→　git clone git@github.com:ito-hironobu/adventure_part3.git

## コントリビューション

ありがとう！みんな

## Licence

[MIT](https://github.com/tcnksm/tool/blob/master/LICENCE)

## Author

[ito-hironobu](https://github.com/ito-hironobu)
