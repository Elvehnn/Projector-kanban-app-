import { useContext, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { DragDropContext, Droppable, DropResult } from 'react-beautiful-dnd';
import Button from '@mui/material/Button';
import KeyboardBackspaceIcon from '@mui/icons-material/KeyboardBackspace';
import AddIcon from '@mui/icons-material/Add';
import { deleteColumn, deleteTask, getBoardById, updateColumn } from '../../api/api';
import AddNewColumnForm from '../AddNewColumnForm/AddNewColumnForm';
import ConfirmPopUp from '../ConfirmPopUp/ConfirmPopUp';
import { Header } from '../Header/Header';
import { IBoard, IColumn, ITask } from '../../constants/interfaces';
import getColumnsColor from '../getColumnsColor/getColumnsColor';
import { GlobalContext } from '../../provider/provider';
import AddNewBoardForm from '../AddNewBoardForm/AddNewBoardForm';
import Notification, { notify } from '../Notification/Notification';
import { Card, Typography, CardContent } from '@mui/material';
import AddNewTaskForm from '../AddNewTaskForm/AddNewTaskForm';
import EditTaskForm from '../EditTaskForm/EditTaskForm';

import { localizationContent } from '../../localization/types';
import Footer from '../Footer/Footer';
import Column from '../Column/Column';

import './board.scss';
import getColor from '../getColumnsColor/getColor';

export const Board = () => {
  const navigate = useNavigate();
  const params = useParams<{ id: string }>().id || '';
  const [board, setBoard] = useState<IBoard | null>(null);
  const [isAddColumnFormOpen, setIsAddColumnFormOpen] = useState(false);
  const [columnToDelete, setColumnToDelete] = useState<IColumn | null>(null);
  const [isShowConfirmPopUp, setShowConfirmPopUp] = useState(false);
  const [columnToAddTask, setColumnToAddTask] = useState<IColumn | null>(null);
  const [taskToEdit, setTaskToEdit] = useState<ITask | null>(null);
  const [taskToDelete, setTaskToDelete] = useState<ITask | null>(null);
  const { isCreateNewBoardOpen } = useContext(GlobalContext);

  const storedColors = board && window.localStorage.getItem(board.id);

  const [colors, setColors] = useState<Map<string, string> | null>(null);

  useEffect(() => {
    getBoardById(params).then(
      (response) => {
        if (response) {
          response.columns.sort((a: IColumn, b: IColumn) => (a.order > b.order ? 1 : -1));
          setBoard(response);
          setColors(
            storedColors
              ? new Map(Object.entries(JSON.parse(storedColors)))
              : getColumnsColor(board)
          );
        }
      },
      (error) => {
        const resMessage =
          (error.response && error.response.data && error.response.data.message) ||
          error.message ||
          error.toString();

        notify(resMessage);
      }
    );

    // return function () {
    //   if (board && colors)
    //     window.localStorage.setItem(board.id, JSON.stringify(Object.fromEntries(colors)));
    // };
  }, [board, colors, params, storedColors]);

  const handleDeleteColumn = async (columnToDelete: IColumn) => {
    if (!board) return;
    try {
      await deleteColumn(board.id, columnToDelete.id);

      const newBoard = await getBoardById(params);
      newBoard.columns.sort((a: IColumn, b: IColumn) => (a.order > b.order ? 1 : -1));
      setBoard(newBoard);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const resMessage = error.message || error.toString();
        notify(resMessage);
      }
    } finally {
      setShowConfirmPopUp(false);
      setColumnToDelete(null);
    }
  };

  const handleDeleteTask = async (task: ITask) => {
    if (!board) return;

    try {
      await deleteTask(task);

      const newBoard = await getBoardById(params);
      newBoard.columns.sort((a: IColumn, b: IColumn) => (a.order > b.order ? 1 : -1));
      setBoard(newBoard);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const resMessage = error.message || error.toString();
        notify(resMessage);
      }
    } finally {
      setShowConfirmPopUp(false);
      setTaskToDelete(null);
    }
  };

  // board?.columns.map((column, index) => {
  //   if (!colors.get(column.id)) {
  //     colors.set(column.id, getColor(index));
  //   }
  // });

  if (board && colors)
    window.localStorage.setItem(board.id, JSON.stringify(Object.fromEntries(colors)));

  const columns = board?.columns.map((column, index) => {
    return (
      <Column
        index={index}
        key={column.id}
        board={board}
        setBoard={setBoard}
        column={column}
        color={colors ? (colors.get(column.id) as string) : '#ggg'}
        setColumnToDelete={setColumnToDelete}
        setShowConfirmPopUp={setShowConfirmPopUp}
        setColumnToAddTask={setColumnToAddTask}
        setTaskToEdit={setTaskToEdit}
        setTaskToDelete={setTaskToDelete}
      />
    );
  });

  async function handleDragEnd(result: DropResult) {
    const { destination, source, type } = result;

    if (!destination) {
      return;
    }

    if (destination.droppableId === source.droppableId && destination.index === source.index) {
      return;
    }

    const reorder = async (list: IColumn[], startIndex: number, endIndex: number) => {
      const result = Array.from(list);
      const [removed] = result.splice(startIndex, 1);
      result.splice(endIndex, 0, removed);
      return result;
    };

    if (type === 'column') {
      if (board) {
        const reorderedColumns = await reorder(board.columns, source.index, destination.index);
        if (board) {
          setBoard({
            id: board.id,
            description: board.description,
            title: board.title,
            columns: reorderedColumns,
          });
          updateColumn(board.id, board.columns[source.index], destination.index + 1);
        }
      }
    }
  }

  return (
    <>
      <Header />

      <div className="board">
        <Button
          sx={{ position: 'absolute', top: '71px', left: '10px' }}
          onClick={() => navigate(-1)}
        >
          <KeyboardBackspaceIcon sx={{ fontSize: '66px' }} />
        </Button>

        <h3>
          {localizationContent.board.header} «{board?.title}»
        </h3>

        <Card sx={{ minWidth: 0.8, overflow: 'unset' }}>
          <CardContent>
            <Typography sx={{ fontSize: 14 }} color="text.secondary" gutterBottom>
              {localizationContent.board.description}
            </Typography>
            <Typography sx={{ fontSize: 18 }} variant="body2" color="text.primary">
              {board?.description}
            </Typography>
          </CardContent>
        </Card>

        <div className="columns-container">
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="all-columns" direction="horizontal" type="column">
              {(provided) => (
                <div className="all-columns" ref={provided.innerRef} {...provided.droppableProps}>
                  {columns}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
          <Button
            variant="outlined"
            className="button-add-item"
            startIcon={<AddIcon />}
            onClick={() => setIsAddColumnFormOpen(true)}
          >
            {localizationContent.buttons.addColumn}
          </Button>
        </div>
      </div>

      <Footer />

      {isAddColumnFormOpen && board && (
        <AddNewColumnForm
          setIsAddColumnFormOpen={setIsAddColumnFormOpen}
          board={board}
          setBoard={setBoard}
        />
      )}
      {columnToDelete && (
        <ConfirmPopUp
          description={`${localizationContent.deleteColumn.description} "${columnToDelete.title}"?`}
          isOpen={isShowConfirmPopUp}
          toShowPopUp={setShowConfirmPopUp}
          onConfirm={() => {
            handleDeleteColumn(columnToDelete);
          }}
          onCancel={() => {
            setShowConfirmPopUp(false);
            setColumnToDelete(null);
          }}
        />
      )}

      {isCreateNewBoardOpen && <AddNewBoardForm />}

      {columnToAddTask && board && (
        <AddNewTaskForm
          setColumnToAddTask={setColumnToAddTask}
          setBoard={setBoard}
          boardId={board.id}
          column={columnToAddTask}
        />
      )}

      {taskToEdit && board && (
        <EditTaskForm
          task={taskToEdit}
          setTaskToEdit={setTaskToEdit}
          setBoard={setBoard}
          boardId={board.id}
        />
      )}

      {taskToDelete && (
        <ConfirmPopUp
          description={`${localizationContent.deleteTask.description} "${taskToDelete.title}"?`}
          isOpen={isShowConfirmPopUp}
          toShowPopUp={setShowConfirmPopUp}
          onConfirm={() => {
            handleDeleteTask(taskToDelete);
          }}
          onCancel={() => {
            setShowConfirmPopUp(false);
            setTaskToDelete(null);
          }}
        />
      )}

      <Notification />
    </>
  );
};
