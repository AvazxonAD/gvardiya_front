function generateFakeItem() {
  //@ts-ignore
  function getRandomNumber(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
  //@ts-ignore

  function getRandomDate(start, end) {
    const date = new Date(
      start.getTime() + Math.random() * (end.getTime() - start.getTime())
    );
    return date.toISOString().split("T")[0];
  }
  //@ts-ignore

  function getRandomNumericString(length) {
    let result = "";
    for (let i = 0; i < length; i++) {
      result += Math.floor(Math.random() * 10);
    }
    return result;
  }

  return {
    id: getRandomNumber(1, 100),
    doc_num: `DOC${getRandomNumber(10000, 99999)}`,
    doc_date: getRandomDate(new Date("2024-01-01"), new Date("2024-12-31")),
    opisanie: "random description",
    batalon_id: getRandomNumber(20, 30),
    batalon_name: getRandomNumericString(5),
    batalon_address: `Random Region, Random Street, ${getRandomNumber(1, 100)}`,
    batalon_str: getRandomNumericString(14),
    batalon_bank_name: "O'zbekiston Respublikasi Markaziy Banki",
    batalon_mfo: getRandomNumericString(6),
    batalon_account_number: getRandomNumericString(20),
    summa: getRandomNumber(1000000, 5000000),
  };
}

//@ts-ignore

export function generateFakeItems(count) {
  return Array.from({ length: count }, generateFakeItem);
}