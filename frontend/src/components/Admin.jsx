import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../AuthContext";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

const emptyQuestion = {
  question: "",
  answers: [
    { text: "", correct: false },
    { text: "", correct: false },
    { text: "", correct: false },
    { text: "", correct: false },
  ],
};

function SortableQuestion({ q, i, handleEdit, handleDelete }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: q.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    position: "relative",
    zIndex: isDragging ? 10 : "auto",
  };

  return (
    <div ref={setNodeRef} style={style} className={`questionCard ${isDragging ? "dragging" : ""}`}>
      <div className="qCardHeader">
        <span className="dragHandle" {...attributes} {...listeners}>⋮⋮</span>
        <span className="qNum">{i + 1}</span>
        <span className="qText">{q.question}</span>
      </div>
      <div className="qCardAnswers">
        {q.answers.map((a, ai) => (
          <span key={ai} className={`qAnswerTag ${a.correct ? "correct" : ""}`}>
            {a.correct && "✓ "}
            {a.text}
          </span>
        ))}
      </div>
      <div className="qCardActions">
        <button className="editBtn" onClick={() => handleEdit(q)}>✏️ Edit</button>
        <button className="deleteBtn" onClick={() => handleDelete(q.id)}>🗑️ Delete</button>
      </div>
    </div>
  );
}

export default function Admin() {
  const [questions, setQuestions] = useState([]);
  const [form, setForm] = useState(emptyQuestion);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const { token, user, logout } = useAuth();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  useEffect(() => {
    if (user?.role === "admin") fetchQuestions();
  }, [user]);

  const fetchQuestions = () => {
    setFetching(true);
    fetch("/api/admin/questions", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then(setQuestions)
      .catch(console.error)
      .finally(() => setFetching(false));
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = questions.findIndex((q) => q.id === active.id);
    const newIndex = questions.findIndex((q) => q.id === over.id);
    const reordered = arrayMove(questions, oldIndex, newIndex);

    const updated = reordered.map((q, i) => ({ ...q, position: i }));
    setQuestions(updated);

    fetch("/api/admin/questions/reorder", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(updated.map((q) => ({ id: q.id, position: q.position }))),
    }).catch(console.error);
  };

  const handleQuestionChange = (e) => {
    setForm({ ...form, question: e.target.value });
  };

  const handleAnswerChange = (index, value) => {
    const answers = [...form.answers];
    answers[index] = { ...answers[index], text: value };
    setForm({ ...form, answers });
  };

  const handleCorrectChange = (index) => {
    const answers = form.answers.map((a, i) => ({
      ...a,
      correct: i === index,
    }));
    setForm({ ...form, answers });
  };

  const resetForm = () => {
    setForm(emptyQuestion);
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const method = editingId ? "PUT" : "POST";
    const url = editingId
      ? `/api/admin/questions/${editingId}`
      : "/api/admin/questions";

    try {
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Failed to save");
      resetForm();
      fetchQuestions();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (q) => {
    setForm({
      question: q.question,
      answers: q.answers.map((a) => ({ ...a })),
    });
    setEditingId(q.id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this question?")) return;
    try {
      const res = await fetch(`/api/admin/questions/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to delete");
      fetchQuestions();
    } catch (err) {
      console.error(err);
    }
  };

  const correctCount = form.answers.filter((a) => a.correct).length;

  return (
    <div className="adminPage">
      <div className="adminTopBar">
        <div className="adminBrand">
          <span className="brandIcon">⚡</span>
          <h1>FlashQuiz Admin</h1>
        </div>
        <div className="adminTopRight">
          <span className="userBadge">👤 {user?.name}</span>
          <Link to="/" className="navBtn">
            🏠 Home
          </Link>
          <button onClick={logout} className="navBtn logoutBtn">
            🚪 Logout
          </button>
        </div>
      </div>

      <div className="adminContainer">
        <div className="adminPanel">
          <div className="adminFormSection">
            <h2>{editingId ? "✏️ Edit Question" : "➕ Add Question"}</h2>
            <form onSubmit={handleSubmit} className="adminForm">
              <div className="inputGroup">
                <label>Question</label>
                <textarea
                  value={form.question}
                  onChange={handleQuestionChange}
                  rows={3}
                  placeholder="Enter your question here..."
                  required
                />
              </div>

              <div className="inputGroup">
                <label>Answers (select the correct one)</label>
                {form.answers.map((a, i) => (
                  <div key={i} className="answerRow">
                    <input
                      type="radio"
                      name="correctAnswer"
                      checked={a.correct}
                      onChange={() => handleCorrectChange(i)}
                      id={`answer-${i}`}
                    />
                    <input
                      type="text"
                      value={a.text}
                      onChange={(e) => handleAnswerChange(i, e.target.value)}
                      placeholder={`Answer ${i + 1}`}
                      required
                    />
                  </div>
                ))}
                {correctCount === 0 && (
                  <small className="fieldError">
                    Please mark one answer as correct
                  </small>
                )}
              </div>

              <div className="formActions">
                <button
                  type="submit"
                  className="primaryBtn"
                  disabled={loading || correctCount !== 1}
                >
                  {loading
                    ? "Saving..."
                    : editingId
                    ? "Update Question"
                    : "Create Question"}
                </button>
                {editingId && (
                  <button
                    type="button"
                    className="secondaryBtn"
                    onClick={resetForm}
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>

          <div className="adminListSection">
            <h2>📋 Questions ({questions.length})</h2>
            {fetching ? (
              <div className="loadingState">Loading questions...</div>
            ) : questions.length === 0 ? (
              <div className="emptyState">No questions yet. Create one above!</div>
            ) : (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={questions.map((q) => q.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="questionList">
                    {questions.map((q, i) => (
                      <SortableQuestion
                        key={q.id}
                        q={q}
                        i={i}
                        handleEdit={handleEdit}
                        handleDelete={handleDelete}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
