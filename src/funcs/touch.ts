export class SimpleTouch{
    readonly targetTouch:Touch|undefined
    constructor(public e:TouchEvent){
        const targetList=e.targetTouches
        if(targetList.length>0){
            let force=0,main:Touch=e.targetTouches[0]
            for(let i=0;i<e.targetTouches.length;i++){
                const temp=e.targetTouches[i]
                if(temp.force>force){
                    main=temp
                    force=main.force
                }
            }
            this.targetTouch=main
        }
    }
}