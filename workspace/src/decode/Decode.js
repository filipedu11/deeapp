
export class Decode{

    constructor(){
        this.key = 0;
        this.value = 1;
    }

    inheritsObject(baseObject, superObject) {
        Object.setPrototypeOf(baseObject, superObject);
    }
}