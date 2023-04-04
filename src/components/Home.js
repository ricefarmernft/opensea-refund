import useFetch from "../hooks/useFetch";
import { useEffect, useState, useRef } from "react";
import Transactions from "./Transactions";
import Loader from "./Loader";
import Web3 from "web3";
import ReactGA from "react-ga4";

const etherscanApi = `${process.env.REACT_APP_ETHERSCAN_API_KEY}`;
const alchemyApi = `${process.env.REACT_APP_ALCHEMY_API_KEY}`;
const web3 = new Web3(`https://eth-mainnet.g.alchemy.com/v2/${alchemyApi}`);

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [eth, setEth] = useState([]);
  const [transactions, setTransactions] = useState([]);

  const [filteredTransactions, setFilteredTransactions] = useState([]);

  const [sort, setSort] = useState(true);
  const [copied, setCopied] = useState(false);

  const [address, setAddress] = useState();

  const tableRef = useRef(null);

  const openseaAddresses = [
    "0x7be8076f4ea4a4ad08075c2508e481d6c946d12b", // Opensea Wyvern Exchange v1
    "0x7f268357a8c2552623316e2562d90e642bb538e5", // Opensea Wyvern Exchange v2
    "0x00000000006cee72100d161c57ada5bb2be1ca79", // Seaport 1.0
    "0x00000000006c3852cbef3e08e8df289169ede581", // Seaport 1.1
    "0x00000000000006c7676171937C444f6BDe3D6282", // Seaport 1.2
    "0x0000000000000aD24e80fd803C6ac37206a45f15", // Seaport 1.3
    "0x00000000000001ad428e4906aE43D8F9852d0dD6", // Seaport 1.4
  ];

  const { get } = useFetch("https://api.etherscan.io/api");
  const totalEth = (eth.result * Math.pow(10, -18)).toFixed(3);

  // Get address from ENS function
  async function getEnsOwner(ens) {
    const owner = await web3.eth.ens.getAddress(ens);
    setAddress(owner);
  }

  // Set Ethereum Address from input
  const onChangeAddress = (event) => {
    event.preventDefault();
    const input = event.target.value;
    if (input.endsWith(".eth")) {
      getEnsOwner(input);
      setLoading(true);
      ReactGA.event({
        category: "Input",
        action: "ENS Input",
      });
    } else if (input.length === 42) {
      setAddress(input);
      setLoading(true);
      ReactGA.event({
        category: "Input",
        action: "Ethereum Address Input",
      });
    } else {
      console.log("Input not valid.");
      setAddress();
      setSort(true);
      setLoading(false);
    }
  };

  // Fetch ETH Balance for input ETH address
  useEffect(() => {
    get(
      `?module=account&action=balance&address=${address}&tag=latest&apikey=${etherscanApi}`
    )
      .then((data) => {
        setEth(data);
      })
      .catch((error) => console.log("Could not load Eth balance", error));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address]);

  // Fetch transactions for ETH address
  useEffect(() => {
    get(
      `?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&page=1&offset=10000&sort=desc&apikey=${etherscanApi}}`
    )
      .then((data) => {
        // Sort data by failed TX and Opensea TX
        const failed = data.result.filter(
          (tx) =>
            (tx.isError === "1" &&
              tx.to
                .toLowerCase()
                .includes(openseaAddresses[0].toLowerCase())) ||
            (tx.isError === "1" &&
              tx.to
                .toLowerCase()
                .includes(openseaAddresses[1].toLowerCase())) ||
            (tx.isError === "1" &&
              tx.to
                .toLowerCase()
                .includes(openseaAddresses[2].toLowerCase())) ||
            (tx.isError === "1" &&
              tx.to
                .toLowerCase()
                .includes(openseaAddresses[3].toLowerCase())) ||
            (tx.isError === "1" &&
              tx.to
                .toLowerCase()
                .includes(openseaAddresses[4].toLowerCase())) ||
            (tx.isError === "1" &&
              tx.to
                .toLowerCase()
                .includes(openseaAddresses[5].toLowerCase())) ||
            (tx.isError === "1" &&
              tx.to.toLowerCase().includes(openseaAddresses[6].toLowerCase()))
        );
        setLoading(false);
        setCopied(false);
        setTransactions(failed);
        setFilteredTransactions(failed);
      })
      .catch((error) => {
        console.log("Could not load Eth balance", error);
        setTransactions([]);
        setFilteredTransactions([]);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address]);

  // Sort TX past 30 days
  useEffect(() => {
    if (!sort) {
      setFilteredTransactions(
        transactions.filter((transaction) => {
          const thirtyDaysDate = new Date();
          thirtyDaysDate.setDate(thirtyDaysDate.getDate() - 30);

          const txDate = new Date(transaction.timeStamp * 1000);

          return txDate > thirtyDaysDate;
        })
      );
    } else {
      setFilteredTransactions(transactions);
    }
    //eslint-disable-next-line
  }, [sort]);

  const handleDateSort = () => {
    setSort(!sort);
  };

  // Copy Table Button
  const copyTable = () => {
    const table = tableRef.current;
    let tableValues = "";
    for (let i = 0; i < table.rows.length; i++) {
      let rowValues = "";
      for (let j = 0; j < table.rows[i].cells.length; j++) {
        rowValues += table.rows[i].cells[j].textContent + "\t";
      }
      tableValues += rowValues + "\n";
    }

    const el = document.createElement("textarea");
    el.value = tableValues;
    document.body.appendChild(el);
    el.select();
    document.execCommand("copy");
    document.body.removeChild(el);
    setCopied(true);
  };

  // Formula for total gas fee
  const totalGas = () => {
    let sum = 0;
    filteredTransactions.forEach((transaction) => {
      sum =
        transaction.gasPrice * transaction.gasUsed * Math.pow(10, -18) + sum;
    });
    return sum;
  };

  return (
    <>
      <div className="container instructions">
        <p>
          Input your ENS or Ethereum Address to receive your Opensea Refund
          Total. Copy the table to Excel or forward it to the{" "}
          <a
            href="https://support.opensea.io/hc/en-us/requests/new"
            target="_blank"
            rel="noreferrer"
          >
            Opensea Help Center
          </a>{" "}
          to receive your refund.
        </p>
      </div>
      <div className="container home">
        <input
          type="text"
          name="address"
          id="address"
          placeholder="Ethereum Address / ENS"
          onChange={onChangeAddress}
        ></input>
        <p>Balance: {totalEth > 0 ? totalEth : 0} Ξ</p>
      </div>
      <div className="container total">
        <p>
          Gas Spent on Failed Opensea Tx's:{" "}
          <span>{totalGas().toFixed(5)} Ξ</span>
        </p>
      </div>
      {loading && <Loader />}
      {address && !loading && (
        <div className="body">
          <div className="container filters">
            <button className="btn-month" onClick={handleDateSort}>
              {sort ? "Sort 30 Days" : "Show All"}
            </button>
            <button
              onClick={copyTable}
              className={copied ? "btn-copy-copied" : "btn-copy"}
            >
              {copied ? "Copied" : "Copy Table"}
            </button>
          </div>
          <div className="container transactions">
            <table ref={tableRef} className="tx-table" id="table-to-xls">
              <thead>
                <tr>
                  <th>Date</th>
                  <th className="th-hash">Tx Hash</th>
                  <th>Gas Fee Ξ</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.map((transaction) => {
                  return (
                    <Transactions
                      key={transaction.hash}
                      transaction={transaction}
                    />
                  );
                })}
              </tbody>
              <tfoot>
                <tr>
                  <th className="th-empty" colSpan="1"></th>
                  <th className="th-fee" colSpan="1">
                    Total Fee Ξ
                  </th>
                  <th className="th-gas">{totalGas().toFixed(5)}</th>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}
    </>
  );
}
