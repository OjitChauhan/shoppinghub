import { useEffect, useState } from "react";
import { FaTrash, FaEdit, FaCheck, FaTimes } from "react-icons/fa";
import Message from "../../components/Message";
import Loader from "../../components/Loader";
import {
  useDeleteUserMutation,
  useGetUsersQuery,
  useUpdateUserMutation,
} from "../../redux/api/usersApiSlice";
import { toast } from "react-toastify";

const UserList = () => {
  const { data: users = [], refetch, isLoading, error } = useGetUsersQuery();
  const [deleteUser]  = useDeleteUserMutation();
  const [updateUser]  = useUpdateUserMutation();

  const [editableUserId,    setEditableUserId]    = useState(null);
  const [editableUserName,  setEditableUserName]  = useState("");
  const [editableUserEmail, setEditableUserEmail] = useState("");

  useEffect(() => { refetch(); }, [refetch]);

  const deleteHandler = async (id) => {
    if (!window.confirm("Delete this user?")) return;
    try { await deleteUser(id).unwrap(); toast.success("User deleted"); refetch(); }
    catch (err) { toast.error(err?.data?.message || err.error); }
  };

  const toggleEdit = (id, username, email) => {
    setEditableUserId(id); setEditableUserName(username); setEditableUserEmail(email);
  };

  const updateHandler = async (id) => {
    if (!(editableUserName.trim() && editableUserEmail.trim())) { toast.error("Name and Email required"); return; }
    try {
      await updateUser({ userId: id, username: editableUserName, email: editableUserEmail }).unwrap();
      toast.success("User updated"); setEditableUserId(null); refetch();
    } catch (err) { toast.error(err?.data?.message || err.error); }
  };

  const inputCls = "w-full px-3 py-1.5 rounded-lg text-sm outline-none bg-gray-50 dark:bg-[#05091A] border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all";

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#05091A] transition-colors px-4 sm:px-6 py-8">
      <div className="max-w-7xl mx-auto">

        <div className="mb-6 flex items-center gap-3">
          <h1 className="text-2xl md:text-3xl font-display font-black text-gray-900 dark:text-white">
            All <span className="text-orange-500">Users</span>
          </h1>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-orange-100 dark:bg-orange-500/15 text-orange-600 dark:text-orange-400">
            {users.length}
          </span>
        </div>

        {isLoading ? <Loader /> : error ? (
          <Message variant="danger">{error?.data?.message || error.error}</Message>
        ) : (
          <div className="rounded-2xl overflow-hidden
            bg-white dark:bg-[#0B1530]
            border border-black/6 dark:border-white/8
            shadow-card-light dark:shadow-card-dark">
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[640px]">
                <thead>
                  <tr className="border-b border-black/6 dark:border-white/8">
                    {["ID","Name","Email","Role","Actions"].map(h => (
                      <th key={h} className="text-left px-4 py-3.5 text-xs font-black uppercase tracking-widest text-gray-400 dark:text-slate-500">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {users.map((user, i) => (
                    <tr key={user._id}
                      className={`border-b border-black/4 dark:border-white/5 transition-colors hover:bg-orange-50 dark:hover:bg-orange-500/6 ${i%2===0?"":"bg-gray-50/50 dark:bg-white/2"}`}>

                      <td className="px-4 py-3 font-mono text-xs text-gray-400 dark:text-slate-500 max-w-[100px] truncate">{user._id}</td>

                      <td className="px-4 py-3">
                        {editableUserId === user._id ? (
                          <div className="flex items-center gap-2">
                            <input type="text" value={editableUserName} onChange={e => setEditableUserName(e.target.value)} className={inputCls} />
                            <button onClick={() => updateHandler(user._id)} className="p-1.5 rounded-lg bg-orange-500 hover:bg-orange-600 text-white transition-all" aria-label="Save">
                              <FaCheck size={11} />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-medium text-gray-800 dark:text-slate-100">{user.username}</span>
                            <button onClick={() => toggleEdit(user._id, user.username, user.email)} className="text-gray-400 dark:text-slate-500 hover:text-orange-500 dark:hover:text-orange-400 transition-colors" aria-label="Edit">
                              <FaEdit size={13} />
                            </button>
                          </div>
                        )}
                      </td>

                      <td className="px-4 py-3">
                        {editableUserId === user._id ? (
                          <div className="flex items-center gap-2">
                            <input type="email" value={editableUserEmail} onChange={e => setEditableUserEmail(e.target.value)} className={inputCls} />
                            <button onClick={() => updateHandler(user._id)} className="p-1.5 rounded-lg bg-orange-500 hover:bg-orange-600 text-white transition-all" aria-label="Save">
                              <FaCheck size={11} />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between gap-2">
                            <a href={`mailto:${user.email}`} className="text-gray-500 dark:text-slate-400 hover:text-orange-500 dark:hover:text-orange-400 transition-colors truncate">{user.email}</a>
                            <button onClick={() => toggleEdit(user._id, user.username, user.email)} className="text-gray-400 dark:text-slate-500 hover:text-orange-500 dark:hover:text-orange-400 transition-colors" aria-label="Edit">
                              <FaEdit size={13} />
                            </button>
                          </div>
                        )}
                      </td>

                      <td className="px-4 py-3">
                        {user.isAdmin ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-orange-100 dark:bg-orange-500/15 text-orange-600 dark:text-orange-400">
                            <FaCheck size={8} /> Admin
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-gray-100 dark:bg-white/8 text-gray-500 dark:text-slate-400">
                            <FaTimes size={8} /> User
                          </span>
                        )}
                      </td>

                      <td className="px-4 py-3">
                        {!user.isAdmin && (
                          <button onClick={() => deleteHandler(user._id)}
                            className="p-2 rounded-xl bg-red-100 dark:bg-red-500/15 text-red-500 dark:text-red-400 hover:bg-red-500 hover:text-white transition-all active:scale-90"
                            aria-label="Delete">
                            <FaTrash size={13} />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserList;
