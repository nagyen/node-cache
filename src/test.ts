import * as console from 'console';
import { Cache } from './cache.decorator';
let num = 0;
export class Test {
    @Cache()
    async date(...args: any[]) {
        num = num++;
        console.log('method invoked', num)
        return num;
    }
}
(async () => {

    await new Test().date();
    await new Test().date();
    await new Test().date();
    await new Test().date();
    await new Test().date();
    await new Test().date();
})()