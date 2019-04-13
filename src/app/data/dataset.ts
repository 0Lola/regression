export class Dataset {
    x: any;
    y: any;
    transformX: any;
    transformY: any;

    constructor(x: any, y: any, transformX?: any, transformY?: any) {
        this.x = x;
        this.y = y;
        this.transformX = transformX;
        this.transformY = transformY;
    }
}
