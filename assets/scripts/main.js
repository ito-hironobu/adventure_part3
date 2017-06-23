var character = require('character');

cc.Class({
    extends: cc.Component,

    properties: {
        talkText: {
            default: null,
            type: cc.Label
        },
        chara1: {
            default: null,
            type: cc.Prefab
        },
        chara2: {
            default: null,
            type: cc.Prefab
        },
        chara3: {
            default: null,
            type: cc.Prefab
        },
    },
    
    // use this for initialization
    onLoad: function () {
        this.charaTimer = 0;
        this.textTimer = 0;
        this.showCharaFin = false;
        this.showTextFin = false;
        this.scenarioRunning = false;
        
        this.now_story_no = 0;
        this.count_for_tmp = 0;///////////////////////////////////
        this.now_scenario_no = 0;
        this.now_talk_no = 0;
        this.story_no_onclick = 0;

        this.talkText.string = "";
        this.tmp = "";

        // プレハブを先に生成しておく（出現/消去はactiveを使って操作する）
        this.canvas = cc.find('Canvas');
        this.character1 = cc.instantiate(this.chara1);
        this.character2 = cc.instantiate(this.chara2);
        this.character3 = cc.instantiate(this.chara3);
        this.canvas.addChild(this.character1);
        this.canvas.addChild(this.character2);
        this.canvas.addChild(this.character3);
        // 各プレハブ（各キャラクタ）を配列に格納
        this.characters = [this.character1, this.character2, this.character3];

        var self = this;
        // JSONファイル読み込み
        var url = cc.url.raw("resources/dataJson.json");
        cc.loader.load(url, function(error, result) { // JSONファイルからデータを読み込む
            if (error !== null) return; // エラーがない場合、処理を抜ける
            self.dataJson = result; // JSONデータを取得

            // ストーリー数、シナリオ数、トーク数を得る
            self.total_story_num = self.dataJson.story.length;
            self.total_scenario_num = self.dataJson.story[self.now_story_no].scenario.length;
            self.total_talk_num = self.dataJson.story[self.now_story_no].scenario[self.now_scenario_no].talk.length;

            self.story_no_onclick = self.now_story_no; // クリック時のストーリー番号
            self.character_on = true;
            self.scenarioRunning = true;

            // キャラをノードにセット
            var ary_of_chara = self.getArrayOfAppearCharacter();
            self.setCharacterToNode(ary_of_chara);
            
        });
        // タッチイベント初期化
        this.setTouchEvent();
    },

    // タッチイベントの登録
    setTouchEvent: function(){
        var self = this;
        cc.eventManager.addListener({
            event: cc.EventListener.TOUCH_ONE_BY_ONE,
            swallowTouch: true,
            // クリック時の動作を登録
            onTouchBegan: function(touch, event){
                // ストーリーを全部表示し終わったなら、returnする
                if(self.now_story_no == self.total_story_num){ return; }

                // タイマーリセット??
                self.charaTimer = 0;
                self.textTimer = 0;
                //self.talkText.string = "";

                // 全ストーリー数、全シナリオ数、全トーク数を得る
                self.total_story_num = self.dataJson.story.length;
                self.total_scenario_num = self.dataJson.story[self.now_story_no].scenario.length;
                self.total_talk_num = self.dataJson.story[self.now_story_no].scenario[self.now_scenario_no].talk.length;

                // シナリオが走っているなら、現在のシナリオを完了させる。
                if(self.scenarioRunning == true){
                    self.scenarioRunning = false; // シナリオ終了扱い
                    self.showCharaFin = true; // キャラ表示終了扱い
                    self.showTextFin = true; // テキスト表示終了扱い

                    // シナリオのキャラ全部を表示させる
                    for(var i = 0; i < self.total_scenario_num; i++){
                        self.now_character = self.dataJson.story[self.now_story_no].scenario[i].character;
                        self.characters[self.now_character - 1].active = true;
                        self.characters[self.now_character - 1].opacity = 255
                    }

                    // 今のシナリオのトークを全部表示させる。
                    self.tmp = "";
                    for(var i = 0; i < self.total_scenario_num; i++){
                        for(var j = self.now_talk_no; j < self.dataJson.story[self.now_story_no].scenario[i].talk.length; j++){
                            self.tmp += self.dataJson.story[self.now_story_no].scenario[i].talk[j] + '\n';
                        }
                    }
                    self.talkText.string = self.tmp;

                    // ストーリーを次に進める /////////////////////////
                    self.now_talk_no = 0;
                    self.now_scenario_no = 0;
                    self.now_story_no++;
                    self.count_for_tmp = 0;///////////////////////////////////
                    // クリックアイコンのアニメーション再生
                    cc.find('clickIcon').active = true;
                    
                }else if(self.scenarioRunning == false){　// シナリオが走っていないなら、次のシナリオを１つ走らせる。
                    cc.find('clickIcon').active = false; // クリックアニメーション停止
                    self.story_no_onclick = self.now_story_no; // クリック時のストーリー番号
                    self.character_on = true;
                    self.talkText.string = "";
                    self.tmp = "";

                    self.character1.active = false;
                    self.character2.active = false;
                    self.character3.active = false;

                    self.showCharaFin = false;
                    self.showTextFin = false;
                    self.scenarioRunning = true;

                    // キャラをノードにセット
                    var ary_of_chara = self.getArrayOfAppearCharacter();
                    self.setCharacterToNode(ary_of_chara);
                }
                // 以降のイベントも取得する場合はtrueを返す
                return true;
            }
        }, self.node);
    },

    // called every frame, uncomment this function to activate update callback
    update: function (dt) {
        // ロードが未完了なら何もしない
        if(this.dataJson === undefined) { return; }

        if(this.scenarioRunning){
            // キャラクタがアクティブかつ、キャラクタ表示未完了ならば
            if(this.character_on && !this.showCharaFin){
                if(this.charaTimer >= 1) {
                    this.charaTimer = 1;
                    this.showCharaFin = true;
                }
                
                // キャラクタを表示する
                this.now_character = this.dataJson.story[this.now_story_no].scenario[this.now_scenario_no].character;
                this.characters[this.now_character - 1].active = true;
                this.characters[this.now_character - 1].opacity = 100 + (255-100) * this.charaTimer;
                if(this.charaTimer == 1){
                    this.characters[this.now_character - 1].getComponent(character).jumpCharacter();
                }

                this.charaTimer += dt;
                this.textTimer = 0;
                this.showTextFin = false;
            }

            // キャラクタ表示完了かつ、テキスト表示未完了ならば
            if(this.showCharaFin && !this.showTextFin){
                this.writeText();

                var scenario = this.dataJson.story[this.now_story_no].scenario[this.now_scenario_no].talk[this.now_talk_no];
                var str_ary = scenario.split('');
                var show_text_ary = [];
                var show_len = Math.floor(this.textTimer / 0.2);
                if(show_len == str_ary.length){
                    // トークを次に進める
                    this.now_talk_no++;
                    if(this.now_talk_no == this.total_talk_num){
                        this.now_talk_no = 0;
                        this.now_scenario_no++;
                        this.count_for_tmp = 0;///////////////////////////////////
                        if(this.now_scenario_no == this.total_scenario_num){
                            this.now_scenario_no = 0;
                            this.now_story_no++;
                        }
                    }

                    this.showTextFin = true;
                    this.showCharaFin = false;
                }

                // storyが次に進んだタイミングで一旦停止して、クリックアイコンはスタート
                if( (this.story_no_onclick + 1) == this.now_story_no ){
                    this.scenarioRunning = false;
                    this.character_on = false;
                    // クリックアイコンのアニメーション再生
                    cc.find('clickIcon').active = true;
                    //this.clickAnim = this.node
                }
                this.textTimer += dt;
                this.charaTimer = 0;
            }
        }
    },
    writeText: function(){
        /*
        storyが先に進まない限りは２人の会話は上下につづけて表示する
        */
        if(this.story_no_onclick == this.now_story_no && this.count_for_tmp == 0){
            if(this.talkText.string != ""){
                this.tmp = this.talkText.string;
            }
            this.count_for_tmp++;
        }
        this.talkText.string = "";
        
        var scenario = this.dataJson.story[this.now_story_no].scenario[this.now_scenario_no].talk[this.now_talk_no];
        var str_ary = scenario.split('');
        cc.log(str_ary);
        var show_text_ary = [];
        var show_len = Math.floor(this.textTimer / 0.2);
        for(var i = 0; i < show_len; i++){
            show_text_ary.push(str_ary[i]);
        }
        if(show_len == str_ary.length){
            show_text_ary.push("\n");
        }
        this.text_tmp = show_text_ary.join("");                                         
        this.text = this.tmp + this.text_tmp;
        this.talkText.string = this.text;
    },

    // 現在のstoryで登場するキャラクターの順番を配列に入れてreturn
    getArrayOfAppearCharacter: function(){
        var ary_of_chara = [];
        for(var i = 0; i < this.dataJson.story[this.now_story_no].scenario.length; i++){
            var tmp = this.dataJson.story[this.now_story_no].scenario[i].character;
            var counter = 0;
            for(var j = 0; j < ary_of_chara.length; j++){
                if(tmp == ary_of_chara[j]){ break; }
                counter++;
            }
            if(counter == ary_of_chara.length){
                ary_of_chara.push(tmp);
            }
        }
        return ary_of_chara;
    },
    // 登場キャラクタ数に応じて、登場位置を設定
    setCharacterToNode: function(ary_of_chara){
        var num = ary_of_chara.length;
        // 登場キャラ数によって分岐
        if(num == 1){
            this.characters[ary_of_chara[0] - 1].x = 0;
        }else if(num == 2){
            this.characters[ary_of_chara[0] - 1].x = -200;
            this.characters[ary_of_chara[1] - 1].x = 200;
        }else if(num == 3){
            this.characters[ary_of_chara[0] - 1].x = 0;
            this.characters[ary_of_chara[1] - 1].x = -350;
            this.characters[ary_of_chara[2] - 1].x = 350;
        }else{
            return;
        }
    }
});
