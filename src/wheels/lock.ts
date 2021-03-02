class Lock{
    private queue:({symbol:symbol,listen:()=>void,failed:boolean})[]=[]
    async get(wait:-1):Promise<symbol>
    async get(wait?:number):Promise<symbol|false>
    async get(wait:number=10000){
        const result=await new Promise((resolve:(val:symbol|false)=>void)=>{
            const symbol=Symbol()
            const profile={
                symbol:symbol,
                listen:()=>{
                    resolve(symbol)
                },
                failed:false
            }
            if(wait>0)
            setTimeout(()=>{
                resolve(false)
                profile.failed=true
            },wait)
            this.queue.push(profile)
            if(this.queue[0].symbol===symbol){
                resolve(symbol)
            }
        })
        return result
    }
    release(symbol:symbol){
        if(this.queue.length===0||this.queue[0].symbol!==symbol)return
        this.queue.shift()
        while(this.queue.length>0&&this.queue[0].failed){
            this.queue.shift()
        }
        if(this.queue.length>0)this.queue[0].listen()
        return
    }
}
export class KillableLock{
    busy=false
    private lock=new Lock()
    private killLock=new Lock()
    private killing=false
    private killedListen=()=>{}
    private killingListen=async()=>{}
    private queue:({symbol:symbol,listen:(killing:boolean)=>void,failed:boolean})[]=[]
    async get(wait:number=10000){
        const result=await new Promise(async(resolve:(val:symbol|false)=>void)=>{
            const symbol=Symbol()
            const profile={
                symbol:symbol,
                listen:(killing:boolean)=>{
                    if(killing){
                        resolve(false)
                        return
                    }
                    resolve(symbol)
                    this.busy=true
                },
                failed:false
            }
            if(wait>0)
            setTimeout(()=>{
                resolve(false)
                profile.failed=true
            },wait)
            const result=await this.lock.get(-1)
            if(this.killing){
                resolve(false)
                this.lock.release(result)
                return
            }
            this.queue.push(profile)
            if(this.queue[0].symbol===symbol){
                resolve(symbol)
                this.busy=true
            }
            this.lock.release(result)
        })
        return result
    }
    async release(symbol:symbol){
        const result=await this.lock.get(-1)
        if(this.queue.length===0||this.queue[0].symbol!==symbol){
            this.lock.release(result)
            return
        }
        this.queue.shift()
        while(this.queue.length>0&&this.queue[0].failed){
            this.queue.shift()
        }
        this.busy=false
        if(this.killing){
            for(let i=0;i<this.queue.length;i++){
                this.queue[i].listen(true)
            }
            this.queue=[]
            this.killedListen()
        }
        else{
            if(this.queue.length>0)this.queue[0].listen(false)
        }
        this.lock.release(result)
        return
    }
    async kill(wait:number=10000){
        const result0=await this.killLock.get(-1)
        const result1=await new Promise(async(resolve:(val:boolean)=>void)=>{
            const result2=await this.lock.get(-1)
            this.killing=true
            this.killedListen=()=>{
                resolve(true)
            }
            if(this.queue.length===0){
                resolve(true)
            }
            else if(wait>0)
            setTimeout(() => {
                resolve(false)
            }, wait)
            const killingListen=this.killingListen
            this.lock.release(result2)
            await killingListen()
        })
        this.killLock.release(result0)
        return result1
    }
    async revive(){
        const result0=await this.killLock.get(-1)
        const result1=await this.lock.get(-1)
        this.killing=false
        this.queue=[]
        this.lock.release(result1)
        this.killLock.release(result0)
    }
    async setKillingListen(symbol:symbol,killingListen=async()=>{}){
        const result=await this.lock.get(-1)
        if(this.queue.length===0||this.queue[0].symbol!==symbol){
            this.lock.release(result)
            return 
        }
        if(this.killing){
            this.lock.release(result)
            await killingListen()
            return
        }
        this.killingListen=killingListen
        this.lock.release(result)
        return
    }
    async sleep(time:number){
        await new Promise(async resolve=>{
            const result=await this.get(time)
            if(result===false){
                resolve(true)
                return
            }
            await this.setKillingListen(result,async()=>{
                await this.release(result)
                resolve(true)
            })
            setTimeout(async()=>{
                await this.release(result)
                resolve(true)
            },time)
        })
    }
}