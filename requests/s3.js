import api from "../services/api";

/* eslint-disable */

export const deleteWithPrefix = async (prefix, bucket) => {
  try {
    const token = localStorage.getItem("token");

    const res = await api.post(
      `/api/s3/deleteWithPrefix`,
      {
        prefix,
        bucket,
      },
      {
        headers: {
          "x-auth-token": token,
        },
      }
    );
    return res.data;
  } catch (error) {
    console.error(error);
  }
};

export const getUploadURL = async (name, fileType, bucket) => {
  try {
    const token = localStorage.getItem("token");

    const res = await api.post(
      `/api/s3/getUploadURL`,
      {
        name,
        fileType,
        bucket,
      },
      {
        headers: {
          "x-auth-token": token,
        },
      }
    );
    return res.data;
  } catch (error) {
    console.error(error);
  }
};

export const putVideoInBucket = async (url, file) => {
  try {
    const config = {
      headers: {
        "Content-Type": file.type,
      },
    };

    const response = await api.put(url, file, config);
    return response;
  } catch (error) {
    console.error(error);
    throw error;
  }
};
export const putImageInBucket = async (url, reader, fileType) => {
  try {
    const token = localStorage.getItem("token");

    const res = await api.put(
      url,
      new Blob([reader.result], { type: fileType }),
      {
        headers: {
          "x-auth-token": token,
        },
      }
    );
    return res;
  } catch (error) {
    console.error(error);
  }
};

export const getDownloadURL = async (name, fileType, bucket, isAttachment) => {
  try {
    const token = localStorage.getItem("token");

    const res = await api.post(
      `/api/s3/getDownloadURL`,
      {
        name,
        fileType,
        bucket,
        isAttachment,
      },
      {
        headers: {
          "x-auth-token": token,
        },
      }
    );
    return res.data;
  } catch (error) {
    console.error(error);
  }
};
export const checkForFileWithPrefix = async (prefix, bucket) => {
  try {
    const token = localStorage.getItem("token");

    const res = await api.post(
      `/api/s3/checkForFileWithPrefix`,
      {
        prefix,
        bucket,
      },
      {
        headers: {
          "x-auth-token": token,
        },
      }
    );
    return res.data;
  } catch (error) {
    console.error(error);
  }
};

export const deleteS3File = async (name, bucket) => {
  try {
    const token = localStorage.getItem("token");

    const res = await api.post(
      `/api/s3/deleteS3File`,
      {
        name,
        bucket,
      },
      {
        headers: {
          "x-auth-token": token,
        },
      }
    );
    return res.data;
  } catch (error) {
    console.error(error);
  }
};

export const compressImage = async (
  name,
  thumbnail,
  bucket,
  type,
  height,
  width
) => {
  try {
    const token = localStorage.getItem("token");

    const res = await api.post(
      `/api/s3/compressImage`,
      {
        name,
        thumbnail,
        bucket,
        type,
        height,
        width,
      },
      {
        headers: {
          "x-auth-token": token,
        },
      }
    );
    return res.data;
  } catch (error) {
    console.error(error);
  }
};
