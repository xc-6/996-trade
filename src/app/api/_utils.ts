interface Filter {
  [key: string]: {
    min?: number | string;
    max?: number | string;
  };
}

interface DBFilter {
  [key: string]: {
    $exists?: boolean;
    $gte?: number | Date;
    $lte?: number | Date;
  };
}

export const generateFilter = (filer: Filter): DBFilter => {
  let arr = Object.keys(filer).map((key) => {
    const query: DBFilter[string] = {};
    const { min, max } = filer[key] ?? {};
    if (min !== undefined) {
      query.$exists = true;
      query.$gte = typeof min === "string" ? new Date(min) : Number(min);
    }
    if (max !== undefined) {
      query.$exists = true;
      query.$lte = typeof max === "string" ? new Date(max) : Number(max);
    }
    return [key, query];
  });
  arr = arr.filter((item) => Object.keys(item[1]).length > 0);
  return Object.fromEntries(arr);
};
