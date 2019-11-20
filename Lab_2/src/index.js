
$(() => {
    const tbody = $('#outTable > table > tbody');
    const myText = $('#myText');
    const decodeMe = $('#decodeMe');

    const huffman = new Huffman();
    const hDecoder = new HuffmanDecoder(huffman);

    let procId = false;
    let oldVal = null;

    
    tbody.html('Wait data...');
    onText();
    onDecode();
    
    myText
        .on('change', onText)
        .on('keyup', () => {
            if(procId) clearTimeout(procId);
            procId = setTimeout(onText, 8e2);
            // onText();
        });

    decodeMe
        .on('input', onDecodeCheck)
        .on('change', onDecode)
        .on('keyup', onDecode);

    $('.arrowfull').on('click', function (e) {
        const target = $(e.target).data('target');
        $(target).toggleClass('showfull');
    });

    // Handlers
    function onText() {
        calcText(myText.val());
        onDecode();
    }
    
    function onDecodeCheck() {
        let decode = decodeMe.val().replace(/[^01 ]/g, '');

        let {
            format,
            cursorPosition
        } = hDecoder.onDis(decode, decodeMe.prop('selectionStart'));

        decodeMe.val(format);
        decodeMe.get(0).selectionStart = decodeMe.get(0).selectionEnd = cursorPosition;
    }
    function onDecode() {
        let code = decodeMe.val();
        let decode = hDecoder.decode(code);
        $('#result').html(decode.join(''));
    }
    
    // Works
    function calcText(text) {
        if (text.length == 0) {
            // Reset
            tbody.html('');
            $('#graph').html('');
            $('#result').html('');
            $('#info').html('');
            decodeMe.attr('disabled', true);
            return;
        }
    
        decodeMe.attr('disabled', false);
    
        if (oldVal == text) {
            return;
        }
        oldVal = text;
    
        // Выполнить расчет
        huffman.go(text);
        // console.log(huffman.toString());
        const othr = huffman.LePart($('#shfn > table'));

        UpdateDataTable(huffman);
        UpdateDataGraph(huffman);
        UpdateDataInfo(huffman, othr);
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
    
    function UpdateDataInfo(huffman, { log2_M = "", l_avrg = "", h_m = "" } = {}) {
        let {
            originalBitCount,
            compressedBitCount,
            compressionPercent,
        } = Utils.calculateCompression(huffman);

        let render = [
            `Original   Data Size: ${originalBitCount}\n`,
            `Compressed Data Size: ${compressedBitCount}\n`,
            `Compression  Ratio: <span style="color:${Utils.getCompTextColor(compressionPercent)};background-color: #fff;">${compressionPercent}%</span>\n`,
            `\n-------\n`,
            `log<sub>2</sub>(M) = ${log2_M}\n`,
            `l<sub>avrg</sub> = ${l_avrg}\n`,
            `h<sub>m</sub> = ${h_m}\n`,
        ];

        $('#info').html(render.join(''));
    }

});
