'use client'
import { useEffect, useState } from 'react'
import { Client, LedgerStream } from 'xrpl'
import BigNumber from 'bignumber.js'

const client = new Client('wss://xahau.org')

const ledgerIndex_1 = 2_000_000
const ledgerIndex_2 = 30_000_000

export default function Home() {
  const [ledgerIndex, setLedgerIndex] = useState<number>()

  useEffect(() => {
    const handleLedger = (ledger: LedgerStream) => {
      setLedgerIndex(ledger.ledger_index)
    }
    client.connect().then(() => {
      client.on('ledgerClosed', handleLedger)
      client.request({
        command: 'subscribe',
        streams: ['ledger'],
      })
    })
    return () => {
      client.off('ledgerClosed', handleLedger)
    }
  })

  const getB2mRate = (ledgerIndex: number) => {
    if (ledgerIndex < ledgerIndex_1) {
      return '1'
    } else if (ledgerIndex < ledgerIndex_2) {
      return BigNumber(ledgerIndex_2).minus(ledgerIndex).div(BigNumber(ledgerIndex_2).minus(ledgerIndex_1)).toFixed(4)
    } else {
      return '0'
    }
  }

  return (
    <main className="min-h-screen text-center p-24 light:bg-slate-50">
      <div className='text-3xl font-bold my-8'>Xahau B2M Rate</div>
      <div className='mb-4'>Current LedgerIndex: <br />
        <span className='text-xl'>{ledgerIndex?.toLocaleString()}</span>
      </div>
      {ledgerIndex &&
        <>
          <div className='mb-4'>Current B2M Rate: <br />
            <span className='text-2xl font-bold'>1 XRP : {getB2mRate(ledgerIndex)} XAH</span>
          </div>
          <div className='mb-4'>
            <progress className="progress progress-primary w-56" value={getB2mRate(ledgerIndex)} max="1"></progress>
          </div>
          <div>
            <ul className="steps steps-vertical">
              <li className={`step step-primary`}>~2m ledger<br/>1 XRP:1 XAH</li>
              <li className={`step ${ledgerIndex > ledgerIndex_1 ? 'step-primary' : ''}`}>~30m ledger<br/>dynamic rate</li>
              <li className={`step ${ledgerIndex > ledgerIndex_2 ? 'step-primary' : ''}`}>30m~ ledger<br/>1 XRP:0 XAH</li>
            </ul>
          </div>
        </>
      }
    </main>
  )
}
