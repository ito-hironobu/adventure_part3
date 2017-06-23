cc.Class({
    extends: cc.Component,

    properties: {
        // foo: {
        //    default: null,      // The default value will be used only when the component attaching
        //                           to a node for the first time
        //    url: cc.Texture2D,  // optional, default is typeof default
        //    serializable: true, // optional, default is true
        //    visible: true,      // optional, default is true
        //    displayName: 'Foo', // optional
        //    readonly: false,    // optional, default is false
        // },
        // ...
    },

    // use this for initialization
    onLoad: function () {
        
    },

    jumpCharacter: function(){
        this._isJumping = true;
        var self = this;

        var jump1 = cc.jumpBy(0.15, 0, 0, 50, 1);
        var jump2 = cc.jumpBy(0.15, 0, 0, 20, 1);

        var endFunction = cc.callFunc(function(){
            self._isJumping = false;
        }, this);

        this.node.runAction(cc.sequence(
            jump1,
            jump2,
            endFunction
        ));
    }

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});
