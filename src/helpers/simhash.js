(function () {
  const crc32 = require('crc-32');
  const natural = require('natural');
  const NGrams = natural.NGrams;

  function compare(file1, file2) {
    return similarity(simhash(file1), simhash(file2));
  }

  function simhashSummary(hash1, hash2) {
    var simhashval = similarity(hash1, hash2);

    //log.debug("File1 simhash:", createBinaryString(hash1));
    //log.debug("File2 simhash:", createBinaryString(hash2));
    //log.debug( "Simhash similarity is "+simhashval+" (%d%% similar)",
               //Math.round(simhashval * 100));

    return Math.round(simhashval * 100);
  }

  function jacardSummary(file1, file2) {
    var jaccard = jaccardIndex(shingles(file1), shingles(file2));
    //log.debug( "Jaccard index is "+jaccard+" (%d%% similar)",
               //Math.round(jaccard * 100) );

    return Math.round(jaccard * 100);
  }

  function hammingWeight(l) {
    var c;
    for(c = 0; l; c++) {
      l &= l-1;
    }
    return c;
  }

  function similarity(simhash1, simhash2) {
    return hammingWeight((simhash1 & simhash2)) /
      hammingWeight((simhash1 | simhash2));
  }

  function shingleHashList(str) {
    var list = [];
    for (var word of shingles(str, 2)) {
      list.push(crc32.str(word) & 0xffffffff);
    }
    return list;
  }

  function shingles(original, kshingles=2) {
    var shingles = new Set();
    for(var wordlist of NGrams.ngrams(original, kshingles, null, '[end]')) {
      shingles.add(wordlist.join(" "));
    }
    return shingles;
  }

  function simhash(str) {
    var shingles = shingleHashList(str);
    var mask = 0x1;
    var simhash = 0x0;
    for(var i = 0; i < 64; i++) {
      var sim = 0;
      for(var s of shingles) {
        sim +=  ((s & mask) == mask) ? 1 : -1;
      }
      simhash |= (sim > 0 ? mask : 0x0);
      mask <<= 1;
    }
    return simhash;
  }

  function jaccardIndex(set1, set2) {
    var total = set1.size + set2.size;
    var intersection = 0;
    for(var shingle of set1 ) {
      if(set2.has(shingle)) {
        intersection++;
      }
    }
    var union = total - intersection;
    return intersection / union;
  }

  function createBinaryString (nMask) {
    for (var nFlag = 0, nShifted = nMask, sMask = ""; nFlag < 32;
         nFlag++, sMask += String(nShifted >>> 31), nShifted <<= 1);
    return sMask;
  }

  return {
    compare: compare,
    hash: simhash,
    simHashSummary: simhashSummary,
    hammingWeight: hammingWeight,
    shingles: shingles,
    jacardSummary: jacardSummary,
    jaccardIndex: jaccardIndex,
    createBinaryString: createBinaryString,
    shingleHashList: shingleHashList
  };
})();
