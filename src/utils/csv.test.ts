import { describe, expect, it } from 'vitest'
import { parseCsv } from './csv'

describe('parseCsv', () => {
  it('legge righe e celle semplici', () => {
    expect(parseCsv('a,b,c\n1,2,3')).toEqual([['a', 'b', 'c'], ['1', '2', '3']])
  })

  it('gestisce virgole dentro le virgolette', () => {
    expect(parseCsv('"7,50",x')).toEqual([['7,50', 'x']])
  })

  it('gestisce virgolette doppie escapate', () => {
    expect(parseCsv('"dice ""ciao""",x')).toEqual([['dice "ciao"', 'x']])
  })

  it('gestisce a capo dentro le virgolette', () => {
    expect(parseCsv('"riga1\nriga2",x\ny,z')).toEqual([['riga1\nriga2', 'x'], ['y', 'z']])
  })

  it('accetta CRLF, BOM e a capo finale', () => {
    expect(parseCsv('﻿a,b\r\n1,2\r\n')).toEqual([['a', 'b'], ['1', '2']])
  })

  it('mantiene le celle vuote, anche in fondo alla riga', () => {
    expect(parseCsv('a,,c\n1,2,')).toEqual([['a', '', 'c'], ['1', '2', '']])
  })

  it('testo vuoto = nessuna riga', () => {
    expect(parseCsv('')).toEqual([])
  })

  it('una virgoletta a metà di un campo non tra virgolette è un carattere normale', () => {
    expect(parseCsv('12" pizza,x')).toEqual([['12" pizza', 'x']])
  })
})
