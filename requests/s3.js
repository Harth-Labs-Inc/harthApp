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

export const getDownloadURL = async (name, fileType, bucket) => {
  try {
    const res = await api.post(`/api/s3/getDownloadURL`, {
      name,
      fileType,
      bucket,
    });
    return res.data;
  } catch (error) {
    console.log(error);
  }
};
export const checkForFileWithPrefix = async (prefix, bucket) => {
  try {
    const res = await api.post(`/api/s3/checkForFileWithPrefix`, {
      prefix,
      bucket,
    });
    return res.data;
  } catch (error) {
    console.log(error);
  }
};

export const deleteS3File = async (name, bucket) => {
  try {
    const res = await api.post(`/api/s3/deleteS3File`, {
      name,
      bucket,
    });
    return res.data;
  } catch (error) {
    console.log(error);
  }
};

export const compressImage = async (name, thumbnail, bucket, type) => {
  try {
    const res = await api.post(`/api/s3/compressImage`, {
      name,
      thumbnail,
      bucket,
      type,
    });
    return res.data;
  } catch (error) {
    console.log(error);
  }
};
