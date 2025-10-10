"use client";

import React, { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { FaSearch, FaEdit, FaTrash, FaSave, FaTimes } from "react-icons/fa";
import GlobalSpinningLoader from "@/components/reusable/SpinnerLoader/GlobalSpinningLoader";
import { UseGetResponse } from "@/hooks/useGetResponse";
import { formatDateTime } from "@/utils/formatDateTime";

type UserRole = "user" | "admin";
type UserStatus = "active" | "inactive" | "pending_verification";

type UserData = {
  contactNumber: string;
  createdAt: string;
  disabled: boolean;
  email: string;
  emailVerified: boolean;
  firstName: string;
  lastName: string;
  role: UserRole;
  status: UserStatus;
  uid: string;
  updatedAt: string;
  username: string;
};

type UserListResponse = {
  message: string;
  data: UserData[] | null;
};

const UsersTable: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [roleFilter, setRoleFilter] = useState<"all" | UserRole>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | UserStatus>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [editingUser, setEditingUser] = useState<UserData | null>(null);

  const pageSize = 10;
  const queryClient = useQueryClient();

  const {
    data: usersData,
    isFetching: isLoading,
    error,
  } = useQuery<UserListResponse>({
    queryKey: ["users"],
    queryFn: async () => UseGetResponse("/api/account/all-users"),
    staleTime: 5 * 60 * 1000,
  });

  const { mutate: updateUser, isPending: isUpdating } = useMutation({
    mutationFn: async (payload: Partial<UserData> & { uid: string }) => {
      const res = await fetch("/api/account/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Failed to update user");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      setEditingUser(null);
    },
  });

  const { mutate: deleteUser, isPending: isDeleting } = useMutation({
    mutationFn: async (uid: string) => {
      const res = await fetch(`/api/account/delete?userId=${uid}`, {
        method: "POST",
      });
      if (!res.ok) throw new Error("Failed to delete user");
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["users"] }),
  });

  const filteredUsers = useMemo(() => {
    if (!usersData?.data) return [];
    let users = usersData.data;

    if (roleFilter !== "all")
      users = users.filter((u) => u.role === roleFilter);
    if (statusFilter !== "all")
      users = users.filter((u) => u.status === statusFilter);

    if (searchTerm.trim()) {
      const lower = searchTerm.toLowerCase();
      users = users.filter(
        (u) =>
          u.email.toLowerCase().includes(lower) ||
          `${u.firstName} ${u.lastName}`.toLowerCase().includes(lower)
      );
    }
    return users;
  }, [usersData, roleFilter, statusFilter, searchTerm]);

  const totalLogs = filteredUsers.length;
  const totalPages = Math.ceil(totalLogs / pageSize);
  const usersList = filteredUsers.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const generatePageNumbers = (): (number | string)[] => {
    const pages: (number | string)[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else if (currentPage <= 4) {
      pages.push(1, 2, 3, 4, 5, "...", totalPages);
    } else if (currentPage >= totalPages - 3) {
      pages.push(
        1,
        "...",
        totalPages - 4,
        totalPages - 3,
        totalPages - 2,
        totalPages - 1,
        totalPages
      );
    } else {
      pages.push(
        1,
        "...",
        currentPage - 1,
        currentPage,
        currentPage + 1,
        "...",
        totalPages
      );
    }
    return pages;
  };

  if (error)
    return (
      <div className="text-2xl font-semibold text-red-500">
        <h3>{(error as Error).message}</h3>
      </div>
    );

  return (
    <>
      <div className="flex flex-wrap gap-4 items-center justify-between mt-6 mb-4">
        <div className="flex flex-wrap gap-2 items-center">
          <select
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value as "all" | UserRole);
              setCurrentPage(1);
            }}
            className="px-3 py-2 border rounded-md text-sm border-accent"
          >
            <option value="all">All Roles</option>
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value as "all" | UserStatus);
              setCurrentPage(1);
            }}
            className="px-3 py-2 border rounded-md text-sm border-accent"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="pending_verification">Pending Verification</option>
          </select>
        </div>

        <div className="relative w-full sm:w-[250px]">
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full px-3 py-2 pl-9 border rounded-md text-sm border-accent"
          />
          <FaSearch className="absolute left-2 top-3 text-gray-500" />
        </div>
      </div>

      {isLoading ? (
        <GlobalSpinningLoader variant="big" />
      ) : (
        <>
          <div className="relative overflow-x-auto rounded-xl">
            <table className="w-full text-sm text-left text-gray-700 table-auto">
              <thead className="text-xs text-white uppercase bg-secondary border border-gray-500">
                <tr>
                  <th className="px-6 py-3">Full Name</th>
                  <th className="px-6 py-3">Email</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Role</th>
                  <th className="px-6 py-3">Created At</th>
                  <th className="px-6 py-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {usersList.length > 0 ? (
                  usersList.map((user) => (
                    <tr
                      key={user.uid}
                      className="border bg-gray-50 border-gray-300"
                    >
                      <td className="px-6 py-4 font-medium text-black whitespace-nowrap">
                        {user.firstName} {user.lastName}
                      </td>
                      <td className="px-6 py-4">{user.email}</td>
                      <td className="px-6 py-4 capitalize">{user.status}</td>
                      <td className="px-6 py-4 capitalize">{user.role}</td>
                      <td className="px-6 py-4">
                        {formatDateTime(user.createdAt)}
                      </td>
                      <td className="px-6 py-4 flex justify-center gap-2">
                        <button
                          onClick={() => setEditingUser(user)}
                          className="bg-yellow-400 hover:bg-yellow-500 text-white px-3 py-2 rounded cursor-pointer"
                        >
                          <FaEdit />
                        </button>
                        <button
                          disabled={isDeleting}
                          onClick={() => deleteUser(user.uid)}
                          className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded disabled:opacity-50 cursor-pointer"
                        >
                          <FaTrash />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={6}
                      className="text-center py-6 text-gray-500 text-sm"
                    >
                      No users found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex flex-wrap justify-center items-center gap-2 mt-6">
              <button
                className="px-3 py-1 rounded bg-gray-200 disabled:opacity-50 text-sm"
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
              >
                Prev
              </button>
              {generatePageNumbers().map((page, idx) =>
                page === "..." ? (
                  <span key={idx} className="px-3 py-1 text-gray-500 text-sm">
                    ...
                  </span>
                ) : (
                  <button
                    key={idx}
                    onClick={() => setCurrentPage(Number(page))}
                    className={`px-3 py-1 rounded text-sm ${
                      currentPage === page
                        ? "bg-secondary text-white"
                        : "bg-gray-100"
                    }`}
                  >
                    {page}
                  </button>
                )
              )}
              <button
                className="px-3 py-1 rounded bg-gray-200 disabled:opacity-50 text-sm"
                onClick={() =>
                  setCurrentPage((p) => Math.min(p + 1, totalPages))
                }
                disabled={currentPage === totalPages}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}

      {editingUser && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-[90%] max-w-md shadow-lg">
            <h3 className="text-xl font-semibold mb-4">Edit User</h3>

            <div className="flex flex-col gap-3">
              <input
                type="text"
                placeholder="First Name"
                value={editingUser.firstName}
                onChange={(e) =>
                  setEditingUser({ ...editingUser, firstName: e.target.value })
                }
                className="border px-3 py-2 rounded border-accent outline-none"
              />
              <input
                type="text"
                placeholder="Last Name"
                value={editingUser.lastName}
                onChange={(e) =>
                  setEditingUser({ ...editingUser, lastName: e.target.value })
                }
                className="border px-3 py-2 rounded border-accent outline-none"
              />
              <input
                type="email"
                placeholder="Email"
                value={editingUser.email}
                onChange={(e) =>
                  setEditingUser({ ...editingUser, email: e.target.value })
                }
                className="border px-3 py-2 rounded border-accent outline-none"
              />
              <select
                value={editingUser.role}
                onChange={(e) =>
                  setEditingUser({
                    ...editingUser,
                    role: e.target.value as UserRole,
                  })
                }
                className="border px-3 py-2 rounded border-accent outline-none"
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <div className="flex justify-end gap-3 mt-5">
              <button
                onClick={() => setEditingUser(null)}
                className="flex items-center gap-2 px-4 py-2 bg-gray-300 rounded cursor-pointer"
              >
                <FaTimes /> Cancel
              </button>
              <button
                disabled={isUpdating}
                onClick={() => updateUser(editingUser)}
                className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded disabled:opacity-50 cursor-pointer"
              >
                <FaSave /> Save
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default UsersTable;
