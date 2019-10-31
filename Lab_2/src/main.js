class Utils {

    /**
     * Посчитать уникальное кол-во символов в строке
     * @param {string} str Входная строка
     * @returns {object} Объект `{ Cимвол: Кол-воПовторений }`
     */
    static calcString(str) {
        const couterSymbols = {};
        const strArray = str.split('');
        
        for (const char of strArray) {
            if(couterSymbols[char] == void 0) {
                couterSymbols[char] = 0;
            }

            couterSymbols[char]++;
        }

        return couterSymbols;
    }

    /**
     * Перевод Объекта `couterSymbols` в массив с классом `xSymbol`
     * @param {object} couterSymbols Объект с подсчитанным кол-вом символов
     * @returns {Array} Массив с классами символов
     */
    static cs2Arr(couterSymbols) {
        const list = [];
        for (const key of Object.keys(couterSymbols)) {
            if (couterSymbols.hasOwnProperty(key)) {
                list.push(new xSymbol(key, couterSymbols[key]));
            }
        }
        return list;
    }

    /* */
    static createTree(symbolZ) {
        const symbols = [ ...symbolZ ];

        if (symbols.length == 1) {
            const left = symbols.pop();
            symbols.push(new xSymbol(left.char, left.count, left));
        }

        while (symbols.length > 1) {
            const r = symbols.pop();
            const l = symbols.pop();
            symbols.push(new xSymbol((l.char + r.char), (l.count + r.count), l, r));
        }

        return symbols.pop();
    }

}

class xSymbol {
    /**
     * Класс `xSymbol`
     * @param {string} char Символ
     * @param {number} count Число повторений символа
     * @param {xSymbol} l Левый сосед `xSymbol`
     * @param {xSymbol} r Правый сосед `xSymbol`
     */
    constructor(char, count, l = false, r = false) {
        this.char = char;
        this.count = count;
        this.l = l;
        this.r = r;
        this.code = '';
    }

    /**
     * Ниодин сосед не установлен
     */
    get soGood() {
        return !(this.r && this.l);
    }
}

/**
 * Класс для работы с кодом Хаффмана
 */
class Huffman {
    /**
     * Инициализация класса Хаффмана
     * @param {string} str Входная строка
     */
    constructor(str) {
        this.str = str;

        const couterSymbols = Utils.calcString(this.str);
        const symbolZ       = Utils.cs2Arr(couterSymbols);

        symbolZ.sort((a, b) => (a.count - b.count)).reverse();

        const tree = Utils.createTree(symbolZ);
        // this.outData = symbolZ;
        this.outData = tree;

        this.calcCode();
    }
    

    calcCode() {
        
    }

    /**
     * Данные для вывода  в виде строки
     */
    toString() {
        return `HelloW: ${this.outData.map(e => (`${e.char}:${e.count}`)).join(', ')}`;
    }
}