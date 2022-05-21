import axios, { AxiosRequestConfig } from 'axios';
import { IColumn } from '../constants/interfaces';

const API_URL = 'https://afternoon-hamlet-46054.herokuapp.com';

axios.interceptors.request.use(function (config: AxiosRequestConfig) {
  const token = JSON.parse(localStorage.getItem('user') as string)?.token || null;

  config.headers = {
    Authorization: `Bearer ${token}`,
  };

  return config;
});

export const signUp = async (username: string, login: string, password: string) => {
  return await axios
    .post(`${API_URL}/signup`, {
      name: username,
      login: login,
      password: password,
    })
    .then((res) => res.data);
};

export const signIn = async (login: string, password: string) => {
  return await axios
    .post(`${API_URL}/signin`, {
      login: login,
      password: password,
    })
    .then((res) => {
      if (res.data.token) {
        localStorage.setItem('user', JSON.stringify(res.data));
      }
      return res.data;
    });
};

export const signOut = async () => {
  localStorage.removeItem('user');
};

export const getUserData = async (id: string) => {
  return await axios.get(`${API_URL}/users/${id}`).then((res) => {
    return res.data;
  });
};

export const editProfile = async (
  username: string,
  login: string,
  password: string,
  id: string
) => {
  return await axios
    .put(`${API_URL}/users/${id}`, {
      name: username,
      login: login,
      password: password,
    })
    .then((res) => res.data);
};

export const deleteUser = async (id: string) => {
  return await axios.delete(`${API_URL}/users/${id}`).then((res) => res.data);
};

export const getBoards = async () => {
  return await axios.get(`${API_URL}/boards`).then((res) => res.data);
};

export const getBoardById = async (id: string) => {
  return await axios.get(`${API_URL}/boards/${id}`).then((res) => res.data);
};

export const addBoard = async (title: string, description: string) => {
  return await axios
    .post(`${API_URL}/boards`, {
      title: title,
      description: description,
    })
    .then((res) => res.data);
};

export const deleteBoard = async (boardId: string) => {
  return await axios.delete(`${API_URL}/boards/${boardId}`).then((res) => res.data);
};

export const addColumn = async (boardId: string, columnTitle: string) => {
  return await axios
    .post(`${API_URL}/boards/${boardId}/columns`, {
      title: columnTitle,
      // order: columnOrder,
    })
    .then((res) => res.data);
};

export const deleteColumn = async (boardId: string, columnId: string) => {
  return await axios
    .delete(`${API_URL}/boards/${boardId}/columns/${columnId}`)
    .then((res) => res.data);
};

export const updateColumn = async (boardId: string, column: IColumn) => {
  return await axios
    .put(`${API_URL}/boards/${boardId}/columns/${column.id}`, {
      title: column.title,
      order: column.order,
    })
    .then((res) => res.data);
};
