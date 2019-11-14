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


    static generateCode(node, nextCode = '') {
        if(!node) {
            return;
        }
        if(node.soGood) {
            node.code = nextCode;
            return;
        }
        
        Utils.generateCode(node.l, nextCode + '0');
        Utils.generateCode(node.r, nextCode + '1');
    }

    static getChar(char) {
        if(char == ' ') {
            return 'Space';
        }
        else if(char == '\n') {
            return 'NL';
        }
        else if(char == '\t') {
            return 'TAB';
        }
        return char;
    }

    static drawGraph(huffman) {
        const { outData } = huffman;

        let symbols = [ ...outData ];
        const size = symbols.length;

        while (symbols.length > 1) {
            const r = symbols.pop();
            const l = symbols.pop();
            symbols.push({
                char: l.char + r.char,
                children: [l, r]
            });
        }

        const root = symbols.pop();

        Utils._drawGraph(root, size);
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
            d.y = d.depth * 70;
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
            .delay((d, i)  => (i * 80))
            .attr("r", 20)
            .style("fill", (d, i) => (d.children || d._children ? '#FFE066' : '#fff'))
            .duration(1000)
            .ease('elastic');

        // Enter the char 
        const charText = nodeEnter.append('text')
            .attr('y', 5)
            .attr("text-anchor", "middle")
            .style('font-size', (d) => (d.char.length > 14) ? 8 : 12);

        charText.transition()
            .delay((d, i) => i * 90)
            .text((d) => d.char);

        // Enter the code & frequency (count)
        const codeText = nodeEnter.append('text')
            .attr("y", 40)
            .attr("id", "code")
            .attr("text-anchor", "middle")
            .style('display', 'none')
            .style('font-size', (d) => ((d.code && d.code.length > 14) ? 8 : 11))
            .style('font-weight', 'normal')
            .text((d) => d.code);

        gNode.on('mouseover', function () {
            d3.select(this)
                .select('#code')
                .style('display', 'block');
        })
        .on('mouseout', function () {
            d3.select(this)
                .select('#code')
                .style('display', 'none');
        })

        // Enter the path code  0/1
        const pathText = nodeEnter.append('text')
            .attr("y", -30)
            .style('font-size', '10px');

        pathText.transition()
            .delay((d, i) => i * 85)
            .text((d) => (d.code ? d.code.substr(d.code.length - 1) : 1));


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
        this.outData = null;

        this.calculate();
    }
    
    calculate() {
        const couterSymbols = Utils.calcString(this.str);
        const symbolZ       = Utils.cs2Arr(couterSymbols);

        symbolZ.sort((a, b) => (a.count - b.count)) /*.reverse()*/;

        this.outData = symbolZ;

        // Создание элементов для дерева
        this.tree = Utils.createTree(this.outData);

        // Расчет кода в дереве
        Utils.generateCode(this.tree);
    }

    /**
     * Данные для вывода в виде строки
     */
    toString() {
        return `HelloW: ${this.outData.map(e => (`${e.char}:${e.count}`)).join(', ')}`;
    }
}