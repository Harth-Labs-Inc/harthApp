import api from "../services/api";

export const getUploadURL = async (name, fileType, bucket) => {
  try {
    const res = await api.post(`/api/s3/getUploadURL`, {
      name,
      fileType,
      bucket,
    });
    return res.data;
  } catch (error) {
    console.log(error);
  }
};

export const putImageInBucket = async (url, reader, fileType) => {
  try {
    const res = await api.put(
      url,
      new Blob([reader.result], { type: fileType })
    );
    return res;
  } catch (error) {
    console.log(error);
  }
};
