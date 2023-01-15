export default function Transactions(props) {
  const { timeStamp, gasPrice, gasUsed, hash } = props.transaction;

  const date = new Date(timeStamp * 1000);

  const gas = (gasPrice * gasUsed * Math.pow(10, -18)).toFixed(5);

  const link = `https://etherscan.io/tx/${hash}`;

  return (
    <>
      <tr className="transaction">
        <td className="time">{date.toLocaleDateString()}</td>
        <td className="hash">
          <a href={link} target="_blank" rel="noreferrer">
            {hash}
          </a>
        </td>
        <td className="gas">{gas}</td>
      </tr>
    </>
  );
}
