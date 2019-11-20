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
            if (couterSymbols[char] == void 0) {
                couterSymbols[char] = 0;
            }

            couterSymbols[char]++;
        }

        return couterSymbols;
    }

    /**
     * Перевод Объекта `couterSymbols` в массив с классом `xSymbol`
     * @param {object} couterSymbols Объект с подсчитанным кол-вом символов
     * @returns {Array<xSymbol>} Массив с классами ``xSymbol``
     */
    static cs2Arr(couterSymbols, strLen) {
        const list = [];
        for (const char of Object.keys(couterSymbols)) {
            if (couterSymbols.hasOwnProperty(char)) {
                const freq = Utils.roundX(couterSymbols[char] / strLen);

                list.push(new xSymbol({
                    char,
                    freq,
                    count: couterSymbols[char],
                }));
            }
        }
        return list;
    }

    /**
     * Создание кода Хаффмана
     * 
     * @param {xSymbol} Первый начальный узел с дочерними элементами
     */
    static createHuffman(symbolZ) {
        const symbols = [...symbolZ];

        if (symbols.length == 1) {
            const l = symbols.pop();

            symbols.push(new xSymbol({
                char: l.char,
                freq: l.freq,
                l,
            }));
        }

        while (symbols.length > 1) {
            const r = symbols.pop();
            const l = symbols.pop();

            symbols.push(new xSymbol({
                char: `${l.char}${r.char}`,
                count: (l.count + r.count),
                freq: Utils.roundX(l.freq + r.freq),
                l, r
            }));

            symbols.sort((a, b) => (b.count - a.count));
        }

        return symbols.pop();
    }

    static roundX(value, dx = 4) {
        value = (Math.round(value * Math.pow(10, dx))) / Math.pow(10, dx);
        return value.toFixed(dx - 1) * 1;
    }

    /* */
    static createTree(symbolZ, clone = true) {
        const tree = clone ? Utils.cloneXSymols(symbolZ) : symbolZ;
        return tree;
    }

    /**
     * Клонирование `xSymbol`
     * @param {xSymbol} symbolZ Массив с классами `xSymbol`
     */
    static cloneXSymols(symbolZ) {
        const newSymbolZ = [];
        if (!Array.isArray(symbolZ)) {
            const newSymbol = symbolZ.clone();
            if (!newSymbol.noChildren) {
                newSymbol.children = Utils.cloneXSymols(newSymbol.children);
            }
            return newSymbol;
        }

        for (const symbol of symbolZ) {
            const newSymbol = symbol.clone();
            if (!newSymbol.noChildren) {
                newSymbol.children = Utils.cloneXSymols(newSymbol.children);
            }
            newSymbolZ.push(newSymbol);
        }
        return newSymbolZ;
    }

    static generateCode(node, nextCode = '') {
        if (!node) {
            return;
        }
        if (node.noChildren) {
            node.code = nextCode;
            return;
        }

        // Node code part
        node.code = nextCode;
        Utils.generateCode(node.l, nextCode + '1');
        Utils.generateCode(node.r, nextCode + '0');
    }

    static getChar(char) {
        if (char == ' ') {
            return 'Space';
        }
        else if (char == '\n') {
            return 'NL';
        }
        else if (char == '\t') {
            return 'TAB';
        }
        return char;
    }

    static drawGraph(huffman) {
        const { tree, outData } = huffman;
        const size = outData.length * 0.9;

        Utils._drawGraph(tree, size);
    }

    static _drawGraph(root, size) {

        // Draw graph 
        const margin = {
            top: 25,
            right: 5,
            bottom: 5,
            left: 5
        };
        const width = (70 * size) - margin.right - margin.left;
        const height = (70 * size) - margin.top - margin.bottom;


        let tree = d3.layout.tree().size([height, width]);
        let diagonal = d3.svg.diagonal().projection(d => [d.x, d.y]);

        let svg = d3.select("#graph").append("svg")
            .attr("width", width + margin.right + margin.left)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


        const nodes = tree.nodes(root),
            links = tree.links(nodes);

        nodes.forEach((d) => {
            d.y = d.depth * 75;
        });


        let i = 0;
        const gNode = svg.selectAll("g.node")
            .data(nodes, (d) => (d.id || (d.id = ++i)));

        const nodeEnter = gNode.enter().append("g")
            .attr("class", "node")
            .attr("transform", (d) => ("translate(" + d.x + "," + d.y + ")"));

        const circle = nodeEnter.append("circle")
            .attr("r", 0);

        circle.transition()
            .delay((d, i) => (i * 80))
            .attr("r", 20)
            .style("fill", (d, i) => ((d.children || d._children) ? '#a5b4c8' : '#d0e9dc'))
            .duration(1000)
            .ease('elastic');

        // Enter the char 
        const charText = nodeEnter.append('text')
            .attr('y', 5)
            .attr("text-anchor", "middle")
            .style('font-size', (d) => ((d.children || d._children) && d.char.length > 14) ? 8 : 12);

        charText.transition()
            .delay((d, i) => i * 90)
            .text((d) => (d.children || d._children) ? d.freq : Utils.getChar(d.char));

        // Enter the code & frequency (count)
        const codeText = nodeEnter.append('text')
            .attr("y", 40)
            .attr("id", "code")
            .attr("text-anchor", "middle")
            // .style('display', 'none')
            .style('font-size', (d) => ((d.code && d.code.length > 10) ? 8 : 12))
            .style('font-weight', 'normal')
            .text((d) => (d.children || d._children) ? '' : d.code);

        gNode.on('mouseover', function () {
            d3.select(this)
                .select('#code')
                .text((d) => (d.children || d._children) ? '' : d.freq);
            // .style('display', 'block');
        })
            .on('mouseout', function () {
                d3.select(this)
                    .select('#code')
                    .text((d) => (d.children || d._children) ? d.freq : d.code);
                // .style('display', 'none');
            });

        // Enter the path code  0/1
        const pathText = nodeEnter.append('text')
            .attr("y", -30)
            .style('font-size', '10px');

        pathText.transition()
            .delay((d, i) => i * 85)
            .text((d) => (d.code ? d.code.substr(d.code.length - 1) : '...'));


        // PATH 
        const path = svg.selectAll("path.link")
            .data(links, (d) => d.target.id);

        const pathT = path.enter()
            .insert("path", "g")
            .attr("class", "link");

        pathT.transition()
            .delay((d, i) => (i * 85))
            .attr("d", diagonal);
    }
}


class xSymbol {
    /**
     * Класс `xSymbol`;
     * 
     * Содержит в себе дочернии узлы
     * 
     * @param {object} options:
     * @param {string} char Символ
     * @param {number} count Число повторений символа
     * @param {number} freq Частота появления символа
     * @param {string} code Двоичный код Хаффмана для символа
     * @param {xSymbol} l Левый сосед `xSymbol`
     * @param {xSymbol} r Правый сосед `xSymbol`
     */
    constructor({
        char = 'none',
        count = 0,
        freq = 0,
        code = '',
        l = false,
        r = false,
    } = {}) {
        this.char = char;
        this.count = count;
        this.freq = freq;
        this.code = code;
        this.l = l;
        this.r = r;
    }

    clone() {
        return new xSymbol({
            char: this.char,
            count: this.count,
            freq: this.freq,
            code: this.code,
            l: this.l,
            r: this.r,
        });
    }

    get children() {
        const children = [];
        if (this.l) {
            children.push(this.l);
        }
        if (this.r) {
            children.push(this.r);
        }
        return children.length ? children : false;
    }

    set children([l, r]) {
        if (l) {
            this.l = l;
        }
        if (r) {
            this.r = r;
        }
    }

    /**
     * Ниодин сосед не установлен
     */
    get noChildren() {
        return !(this.r && this.l);
    }
}

/**
 * Класс для работы с кодом Хаффмана
 */
class Huffman {
    /**
     * Инициализация класса Хаффмана
     * @param {string} str Если есть Входная строка, то выполнить расчет
     */
    constructor(str) {
        window.hh = this;

        this.str = str;
        this.outData = null;
        this.huffman = null;
        this.tree = null;

        if (str) {
            this.calculate();
        }
    }

    /**
     * Выполнить расчет полученной строки
     * @param {string} str Входная строка
     * @returns {this}
     */
    go(str) {
        this.str = str;
        this.calculate();
        return this;
    }

    calculate() {
        const strLen = this.str.length;
        const couterSymbols = Utils.calcString(this.str);
        const symbolZ = Utils.cs2Arr(couterSymbols, strLen);

        symbolZ.sort((a, b) => (b.count - a.count));
        this.outData = symbolZ;

        // Формирование кода Хаффмана
        this.huffman = Utils.createHuffman(symbolZ);

        // Расчет кода в дереве
        Utils.generateCode(this.huffman);

        // Создание элементов для дерева
        this.tree = Utils.createTree(this.huffman);
    }

    /**
     * Данные для вывода в виде строки
     */
    toString() {
        const q1 = `${this.outData.map(e => (`\n\t${Utils.getChar(e.char)}\t:${e.count}\t:${e.freq}`)).join(';')}`;
        return `HelloW: ${q1}`;
    }
}

class HuffmanDecoder {
    constructor(huffman, code) {
        this.huffman = huffman;
        this.code = code;
    }

    onDis(origCode, _cursorPosition) {
        let node = this.huffman.huffman;
        let code = origCode;
        const output = [];
        let backUp = [];

        while (code.length > 0) {
            const ch = code.charAt(0);

            if (ch === '1' && node.l) {
                node = node.l;
            }
            else if (ch === '0' && node.r) {
                node = node.r;
            }

            // Это найденный символ: добавляем его в вывод и начинаем поиск след. кода сначала
            if (node.noChildren) {
                backUp = [];
                output.push(node.code);
                node = this.huffman.huffman;
            }
            if (!node.noChildren) {
                // backUp.push(code.substr(1));
                backUp = [];
                backUp.push(node.code);
            }

            code = code.substr(1);
        }

        backUp = backUp.filter(e => !!e);

        // console.log('origCode', origCode);
        // console.log('code', code);
        // console.log('backUp', backUp/* .join('') */);
        // console.log('output.join', output.join(' '));
        // console.log('===\n\n');

        const format = output.join(' ') + ((output.length > 0 && backUp.length > 0) ? ' ' : '') + backUp.join('');
        
        // TODO: Calulate offset cursor position
        const cursorPosition = _cursorPosition;
        console.log('cursorPosition', cursorPosition);

        return {
            format,
            cursorPosition
        };
    }

    decode(code) {
        this.code = code.split(' ').join('');
        const result = this._decode();

        // console.log(result.join());
        return result;
    }

    _decode() {
        let code = this.code;

        let node = this.huffman.huffman;
        const output = [];

        while (code.length > 0) {
            const ch = code.charAt(0);

            if (ch === '1' && node.l) {
                node = node.l;
            }
            else if (ch === '0' && node.r) {
                node = node.r;
            }

            // Это найденный символ: добавляем его в вывод и начинаем поиск след. кода сначала
            if (node.noChildren) {
                output.push(node.char);
                node = this.huffman.huffman;
            }

            code = code.substr(1);
        }

        return output;
    }
}