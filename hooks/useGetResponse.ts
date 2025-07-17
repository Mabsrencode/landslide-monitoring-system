const UseGetResponse = async (endpoint: string) => {
  try {
    const response = await fetch(`${endpoint}`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.log(error);
    return error;
  }
};

export { UseGetResponse };
