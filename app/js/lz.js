// Compresión LZ síncrona a UTF-16 para localStorage.
// Adaptado del algoritmo de lz-string (compressToUTF16/decompressFromUTF16)
// de Pieroxy, licencia MIT: https://github.com/pieroxy/lz-string
// Cada carácter de salida lleva 15 bits útiles (+32), así que nunca produce
// sustitutos UTF-16 sueltos y el resultado se puede guardar en archivos UTF-8.

function comprimir(texto, bitsPorCaracter, aCaracter) {
  if (texto == null) return "";
  const diccionario = new Map();
  const porCrear = new Set();
  let w = "";
  let ampliarEn = 2;
  let tamDic = 3;
  let numBits = 2;
  const salida = [];
  let valor = 0;
  let posicion = 0;

  const escribirBit = (bit) => {
    valor = (valor << 1) | bit;
    if (posicion === bitsPorCaracter - 1) {
      posicion = 0;
      salida.push(aCaracter(valor));
      valor = 0;
    } else posicion++;
  };
  const escribir = (v, bits) => {
    for (let i = 0; i < bits; i++) {
      escribirBit(v & 1);
      v >>= 1;
    }
  };
  const decrementar = () => {
    ampliarEn--;
    if (ampliarEn === 0) {
      ampliarEn = 2 ** numBits;
      numBits++;
    }
  };
  const emitir = (cadena) => {
    if (porCrear.has(cadena)) {
      const codigo = cadena.charCodeAt(0);
      if (codigo < 256) {
        escribir(0, numBits);
        escribir(codigo, 8);
      } else {
        escribir(1, numBits);
        escribir(codigo, 16);
      }
      decrementar();
      porCrear.delete(cadena);
    } else {
      escribir(diccionario.get(cadena), numBits);
    }
    decrementar();
  };

  for (let i = 0; i < texto.length; i++) {
    const c = texto.charAt(i);
    if (!diccionario.has(c)) {
      diccionario.set(c, tamDic++);
      porCrear.add(c);
    }
    const wc = w + c;
    if (diccionario.has(wc)) {
      w = wc;
    } else {
      emitir(w);
      diccionario.set(wc, tamDic++);
      w = c;
    }
  }
  if (w !== "") emitir(w);
  escribir(2, numBits); // fin de flujo
  // Vaciar el último carácter
  for (;;) {
    valor <<= 1;
    if (posicion === bitsPorCaracter - 1) {
      salida.push(aCaracter(valor));
      break;
    }
    posicion++;
  }
  return salida.join("");
}

function descomprimir(longitud, reinicio, siguiente) {
  const diccionario = [0, 1, 2];
  let ampliarEn = 4;
  let tamDic = 4;
  let numBits = 3;
  const resultado = [];
  const datos = { val: siguiente(0), pos: reinicio, idx: 1 };

  const leer = (n) => {
    let bits = 0;
    let potencia = 1;
    const max = 2 ** n;
    while (potencia !== max) {
      const b = datos.val & datos.pos;
      datos.pos >>= 1;
      if (datos.pos === 0) {
        datos.pos = reinicio;
        datos.val = siguiente(datos.idx++);
      }
      bits |= (b > 0 ? 1 : 0) * potencia;
      potencia <<= 1;
    }
    return bits;
  };

  let c;
  switch (leer(2)) {
    case 0:
      c = String.fromCharCode(leer(8));
      break;
    case 1:
      c = String.fromCharCode(leer(16));
      break;
    default:
      return "";
  }
  diccionario[3] = c;
  let w = c;
  resultado.push(c);
  for (;;) {
    if (datos.idx > longitud) return "";
    let codigo = leer(numBits);
    if (codigo === 0 || codigo === 1) {
      diccionario[tamDic++] = String.fromCharCode(leer(codigo === 0 ? 8 : 16));
      codigo = tamDic - 1;
      ampliarEn--;
    } else if (codigo === 2) {
      return resultado.join("");
    }
    if (ampliarEn === 0) {
      ampliarEn = 2 ** numBits;
      numBits++;
    }
    let entrada;
    if (diccionario[codigo]) entrada = diccionario[codigo];
    else if (codigo === tamDic) entrada = w + w.charAt(0);
    else return null; // datos corruptos
    resultado.push(entrada);
    diccionario[tamDic++] = w + entrada.charAt(0);
    ampliarEn--;
    w = entrada;
    if (ampliarEn === 0) {
      ampliarEn = 2 ** numBits;
      numBits++;
    }
  }
}

export function comprimirUTF16(texto) {
  if (texto == null) return "";
  return comprimir(texto, 15, (a) => String.fromCharCode(a + 32)) + " ";
}

export function descomprimirUTF16(comprimido) {
  if (comprimido == null) return "";
  if (comprimido === "") return null;
  return descomprimir(comprimido.length, 16384, (i) => comprimido.charCodeAt(i) - 32);
}
