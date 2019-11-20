
$(() => {
    const tbody = $('#outTable > tbody');
    const myText = $('#myText');

    const huffman = new Huffman();

    let procId = false;
    let oldVal = null;

    
    tbody.html('Wait data...');
    onText();
    
    myText
        .on('change', onText)
        .on('keyup', () => {
            if(procId) clearTimeout(procId);
            procId = setTimeout(onText, 8e2);
            // onText();
        });

    // Handlers
    function onText() {
        calcText(myText.val());
    }
    
    // Works
    function calcText(text) {
        if (text.length == 0) {
            // Reset
            tbody.html('');
            $('#graph').html('');
            return;
        }
    
        if (oldVal == text) {
            return;
        }
        oldVal = text;
    
        // Выполнить расчет
        huffman.go(text);
        // console.log(huffman.toString());
    
        UpdateDataTable(huffman);
        UpdateDataGraph(huffman);
    }
    
    function UpdateDataTable(huffman) {
        const { outData } = huffman;
    
        // Reset
        tbody.html('');
    
        const size = huffman.str.length;
        for (const item of outData) {
            const { count, code } = item;
            const char = Utils.getChar(item.char);
            const p = (count / size).toFixed(3);
    
            tbody.append(`
                <tr>
                    <td>${char}</td>
                    <td>${count}</td>
                    <td>${p}</td>
                    <td>${code}</td>
                </tr>
            `);
        }
    }
    
    function UpdateDataGraph(huffman) {
        $('#graph').html('');
        Utils.drawGraph(huffman);
    }

});
