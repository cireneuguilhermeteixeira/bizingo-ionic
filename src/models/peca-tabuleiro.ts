export class PecaTabuleiro{
    id:number;
    player:number;//1 ou 2
    type:String; //captain ou regular
    x:number;
    y:number;
    cssProperty: CssProperty;
}

class CssProperty{
    'margin-left': String;
    'margin-top': String;
}