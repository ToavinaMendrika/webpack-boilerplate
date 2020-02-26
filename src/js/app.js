import {foo} from './modules/hello'
import { cube } from './math'
console.log(cube(3))

document.querySelector('h1').innerText = 'test 8'

foo();


/**
 * Hot reload
 * Accept update
 */
if (module.hot) {
    console.log('hot reload enabled in app')
    module.hot.accept();
}