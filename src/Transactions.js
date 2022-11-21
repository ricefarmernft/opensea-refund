export default function Transactions(props) {
  const { timeStamp, hash, gasPrice, gasUsed } = props.transaction;

  const date = new Date(timeStamp * 1000);

  const gas = (gasPrice * gasUsed * Math.pow(10, -18)).toFixed(5);

  const link = `https://etherscan.io/tx/${hash}`;

  return (
    <>
      <tr className="transaction">
        <td className="time">
          <p>
            {date.toDateString()} <br /> {date.toLocaleTimeString()}
          </p>
        </td>
        <td className="hash">
          <p>{hash}</p>
        </td>
        <td className="gas">
          <p>{gas}Ξ</p>
        </td>
        <td className="link">
          <a href={link} target="_blank" rel="noreferrer">
            Etherscan
          </a>
        </td>
      </tr>
    </>
  );
}
