/* содержит код и map букв */
class Block {
   // fmap - финальный map
   constructor(code, map, finalMap, start) {
      this.code = code;
      this.map = map;
      this.fmap = finalMap;
      this.blocks = [];
      this.start = start;
   }

   // возвращает 2 новых блока или: null (если map.size() == 1) и записывает содержимое map в fmap
   goSplitHalf (rows) {
   
      // если блок можно разделить
      if(this.map.size > 1) {
         let m1, m2, code1 = this.code + '0', code2 = this.code + '1';
         if(this.map == undefined) debugger;
         [m1, m2] = splitMap(this.map);
         this.blocks[0] = new Block(code1, m1, this.fmap, this.start);
         this.blocks[1] = new Block(code2, m2, this.fmap, this.start + m1.size);
         // debugger;
         $(rows[this.start]).append(`<td rowspan="${m1.size}">0</td>`);
         $(rows[this.start + m1.size]).append(`<td rowspan="${m2.size}">1</td>`)
         this.blocks[0].goSplitHalf(rows);
         this.blocks[1].goSplitHalf(rows);
      }
      // если блок нельзя разделить
      else {
         this.fmap.set(Array.from(this.map)[0][0], this.code);
      }
   }
}


/* ========================================= */


function create_ShF_Table() {
   const t = $('#table');
   t.html('');
   
   const trow = [];
   
   for(let i of lFreq.keys()) {
      trow.push({
         char: i,
         freq: lFreq.get(i)
      });
   }
   
   for (const e of trow) {

      let str = ``;

      // for(const q of e) {
      //    str += `<td rowspan="${q.len}">${q.code}</td>`
      // }

      t.append(`
         <tr>
            <td>${e.char} - ${e.freq}</td>
            ${str}            
         </tr>
      `);
   }
}

function splitMap(map) {
   let m1, m2, sum1, sum2;

   for(let i = 1; i < map.size; i++) {
      // заполняем t1 и t2
      m1 = new Map(Array.from(map).slice(0, i));
      m2 = new Map(Array.from(map).slice(i, map.size));
      // см. чтобы сумма t1 была больше суммы t2
      // debugger;
      sum1 = Array.from(m1).reduce((acc, val) => acc + val[1], 0);
      sum2 = Array.from(m2).reduce((acc, val) => acc + val[1], 0);
      if(sum1 >= sum2) return [m1, m2];
   }
}

/**
 * строим дерево Хаффмана.
 * если huffman[i].node.parents == BinNode: узел раздваивается
 * если huffman[i].node.parents == строка: пишем эту букву в узле, узел закончился
 */
class BinNode {

   constructor(value, parents) {
      this.value = roundNumber(value, 3);;
      this.parents = parents;
   }
   
   createBranch(code, node) {
      // если предок буква (по факту)
      if(typeof this.parents == "string") {
         huffman_codes[this.parents] = code;
      }
      else {
         // Фурычим лево-право
         for(let i = 0; i < 2; i++) {
            node[i] = {
               children: []
            };

            let name = '';

            if(typeof this.parents[i].parents == 'string') {
               name = `"${this.parents[i].parents}"`;
            }
            else name = '<node>';

            node[i].name = `${this.parents[i].value} - ${name} - ${code + i}`;

            this.parents[i].createBranch(code + i, node[i].children);
         }
      }
   }
}

function roundNumber(rnum, rlength) { 
   let newnumber = Math.round(rnum * Math.pow(10, rlength)) / Math.pow(10, rlength);
   return newnumber;
}



/* =============================== */


/*
..%%%%...%%%%%%...%%%%...%%%%%...%%%%%%.
.%%........%%....%%..%%..%%..%%....%%...
..%%%%.....%%....%%%%%%..%%%%%.....%%...
.....%%....%%....%%..%%..%%..%%....%%...
..%%%%.....%%....%%..%%..%%..%%....%%...
........................................
*/


/**
 * Коды для всех букв
 */
let huffman_codes = {};

((str) => {
   const strLen = str.length;

   /**
    * Array chars counter;
    * кол-во вхождений букв
    */
   const lCount = calcLCount(str);

   /**
    * Частоты букв
    */
   const lFreq = calcFreq(lCount, strLen);

   console.log('lFreq:', lFreq);
   
   const huffman = createHuffman(lFreq);
   console.log('huffman:', huffman);
   console.log('huffman_codes: ', huffman_codes);

   $('body').append("<p>Дерево Хаффмена</p>");
   const treeData = createTree(huffman);
   console.log('treeData', treeData);

   drawHuffmanTree(treeData);


   
})('My test mega supre text');


function calcLCount(str) {
   lCount = new Map();

   for (let symbol of str) {
      symbol = (symbol == ' ') ? '_' : symbol;

      if (!lCount.has(symbol)) {
         lCount.set(symbol, 1);
      }
      else {
         lCount.set(symbol, lCount.get(symbol) + 1);
      }
   }

   return lCount;
}


function calcFreq(lCount, strLen) {
   let lFreq = new Map();

   for (let l of lCount.keys()) {
      lFreq.set(l, lCount.get(l) / strLen);
   }

   //lFreq.sort((a, b) => b.value - a.value);
   lFreq = new Map([...lFreq.entries()].sort((a, b) => b[1] - a[1]));
   return lFreq;
}

function createHuffman(lFreq) {

   /**
    * Столбцы по Хаффману
    */
   const huffman = [
      { // 1-й столбец
         arr: [],
         node: null
      }
   ];

   for (let l of lFreq.keys()) {
      huffman[0].arr.push(new BinNode(lFreq.get(l), l));
   }

   console.log('huffman: ', huffman);


   for (let i = 1; huffman[i - 1].arr.length != 1; i++) {
      huffman[i] = { arr: [] };

      // Сортировка по частоте
      huffman[i - 1].arr.sort((a, b) => b.value - a.value);

      huffman[i].arr = huffman[i - 1].arr.slice(0, -2);

      const node = new BinNode(
         huffman[i - 1].arr[huffman[i - 1].arr.length - 1].value
            + huffman[i - 1].arr[huffman[i - 1].arr.length - 2].value,

         [huffman[i - 1].arr[huffman[i - 1].arr.length - 1],
         huffman[i - 1].arr[huffman[i - 1].arr.length - 2]]
      );
      
      // node.value = roundNumber(node.value, 3);
      huffman[i].arr.push(node);
      huffman[i].node = node;
   }

   return huffman;
}

function createTree(huffman) {
   const treeData = [
      {
         name: huffman[huffman.length - 1].node.value,
         children: []
      }
   ];

   huffman[huffman.length - 1].node.createBranch('', treeData[0].children);

   return treeData;
}

function drawHuffmanTree(treeData) {

   // ************** Generate the tree diagram  *****************
   let margin = {
         top: 20,
         right: 120,
         bottom: 20,
         left: 120
      },
      width = 1200 - margin.right - margin.left,
      height = 500 - margin.top - margin.bottom;
   let i = 0;

   let tree = d3.layout.tree()
      .size([height, width]);

   let diagonal = d3.svg.diagonal()
      .projection(function (d) {
         return [d.y, d.x];
      });

   let svg = d3.select("body")
      .append("svg")
      .attr("width", width + margin.right + margin.left)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")")

   root = treeData[0];
   update(root);

   function update(source) {
      // Compute the new tree layout.
      let nodes = tree.nodes(root)
         .reverse(),
         links = tree.links(nodes);

      // Normalize for fixed-depth.
      nodes.forEach(function (d) {
         d.y = d.depth * /* 180 */160; // WIDTH SCALE !
      });

      // Declare the nodes
      let node = svg.selectAll("g.node")
         .data(nodes, function (d) {
            return d.id || (d.id = ++i);
         });

      // Enter the nodes.
      let nodeEnter = node.enter()
         .append("g")
         .attr("class", "node")
         .attr("transform", function (d) {
            return "translate(" + d.y + "," + d.x + ")";
         });

      nodeEnter.append("circle")
         .attr("r", 10)
         .style("fill", "#fff");

      nodeEnter.append("text")
         .attr("x", function (d) {
            return d.children || d._children ? -13 : 13;
         })
         .attr("dy", ".35em")
         .attr("text-anchor", function (d) {
            return d.children || d._children ? "end" : "start";
         })
         .text(function (d) {
            return d.name;
         })
         .style("fill-opacity", 1);

      // Declare the links
      let link = svg.selectAll("path.link")
         .data(links, function (d) {
            return d.target.id;
         });

      // Enter the links.
      link.enter()
         .insert("path", "g")
         .attr("class", "link")
         .attr("d", diagonal);
   }
}


/*
let l_avrg = 0;
for(let l in huffman_codes) {
   l_avrg += huffman_codes[l].length * lFreq.get(l);
}
l_avrg = roundNumber(l_avrg, 3);
console.log('l_avrg:', l_avrg);
console.log('log2(M):', Math.log(lCount.size) / Math.log(2));



let h_m = 0;
for(let l of lFreq.keys()) {
   h_m += lFreq.get(l) * Math.log(lFreq.get(l)) / Math.log(2);
}
h_m *= -1;
console.log('H(M) = sum([i=1...m], p_i*log2(p_i)):', h_m);

$('body').append( "<p>Шеннон-Фано</p>" );
let shF_codes = new Map(); // коды по Шеннону-Фано

let shF = new Block('', lFreq, shF_codes, 0); // Shennon-Fano


let arr = Array.from(lFreq.keys());
let rows = [];
for(let i = 0; i < lFreq.size; i++) {
   rows.push(document.createElement('tr'));
   $(rows[i]).append(`<td>${arr[i]} : ${lFreq.get(arr[i])}</td>`);
}
let table = $('<table border=1></table>');
$(table).append(rows);
$('body').append(table);
//debugger;


shF.goSplitHalf(rows);
//create_ShF_Table();

console.log('shF_codes:', shF_codes);

*/

/*
   массив, упорядоченный по вероятностям
      (1) делим на 2 близкие по вероятностям массива и 1-й обозначаем "0", а 2-ой - "1"
         с ними повторяем п.2
            если полученный массив содержит 1 эл-т, то заносим его эл-т и код в итоговый массив
*/





