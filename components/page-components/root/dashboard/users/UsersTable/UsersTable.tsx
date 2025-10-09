"use client";
import React, { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { FaUserShield, FaUser, FaUserClock, FaSearch } from "react-icons/fa";
import GlobalSpinningLoader from "@/components/reusable/SpinnerLoader/GlobalSpinningLoader";
import { UseGetResponse } from "@/hooks/useGetResponse";
import { formatDateTime } from "@/utils/formatDateTime";

const UsersTable = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [roleFilter, setRoleFilter] = useState<"all" | "user" | "admin">("all");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "active" | "inactive" | "pending_verification"
  >("all");
  const [searchTerm, setSearchTerm] = useState("");

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

  const { mutate: changeRole, isPending: isUpdating } = useMutation({
    mutationFn: async ({
      uid,
      newRole,
    }: {
      uid: string;
      newRole: "user" | "admin";
    }) => {
      const res = await fetch("/api/account/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uid, role: newRole }),
      });

      if (!res.ok) throw new Error("Failed to update user role");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
  const filteredUsers = useMemo(() => {
    if (!usersData?.data) return [];
    let users = usersData.data;

    if (roleFilter !== "all") {
      users = users.filter((user) => user.role === roleFilter);
    }

    if (statusFilter !== "all") {
      users = users.filter((user) => user.status === statusFilter);
    }

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

  if (error)
    return (
      <div className="text-2xl font-semibold manrope text-red-500">
        <h3>{error.message}</h3>
      </div>
    );

  const totalLogs = filteredUsers.length;
  const totalPages = Math.ceil(totalLogs / pageSize);

  const usersList = filteredUsers.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const generatePageNumbers = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 4) {
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
    }
    return pages;
  };

  return (
    <>
      <div className="flex flex-wrap gap-4 items-center justify-between mt-6 mb-4">
        <div className="flex flex-wrap gap-2 items-center">
          <select
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value as "all" | "user" | "admin");
              setCurrentPage(1);
            }}
            className="px-3 py-2 border rounded-md text-sm outline-none border-accent"
          >
            <option value="all">All Roles</option>
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(
                e.target.value as
                  | "all"
                  | "active"
                  | "inactive"
                  | "pending_verification"
              );
              setCurrentPage(1);
            }}
            className="px-3 py-2 border rounded-md text-sm outline-none border-accent"
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
            className="w-full px-3 py-2 pl-9 border rounded-md text-sm outline-none border-accent"
          />
          <FaSearch className="absolute left-2 top-3 text-gray-500" />
        </div>
      </div>

      {isLoading ? (
        <GlobalSpinningLoader variant="big" />
      ) : (
        <>
          <div className="relative overflow-x-auto rounded-xl">
            <table className="w-full text-sm text-left rtl:text-right text-gray-700 table-auto">
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
                      <td className="px-6 py-4">
                        <button
                          disabled={
                            isUpdating || user.status === "pending_verification"
                          }
                          onClick={() =>
                            changeRole({
                              uid: user.uid,
                              newRole: user.role === "admin" ? "user" : "admin",
                            })
                          }
                          className={`px-3 py-2 rounded text-white flex items-center gap-2 ml-auto w-full justify-center cursor-pointer
                            ${
                              user.role === "admin"
                                ? "bg-blue-500 hover:bg-blue-600"
                                : "bg-green-500 hover:bg-green-600"
                            }
                            disabled:opacity-50 transition disabled:bg-gray-500 disabled:cursor-not-allowed`}
                        >
                          {user.status === "pending_verification" ? (
                            <>
                              <FaUserClock className="text-white text-xl" /> Not
                              Verified
                            </>
                          ) : user.role === "admin" ? (
                            <>
                              <FaUser className="text-white text-xl" /> Set User
                            </>
                          ) : (
                            <>
                              <FaUserShield className="text-white text-xl" />{" "}
                              Set Admin
                            </>
                          )}
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
                      No users match your filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex flex-wrap justify-center items-center gap-2 mt-6">
              <button
                className="px-3 py-1 rounded bg-gray-200 disabled:opacity-50 cursor-pointer text-sm"
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
                    className={`px-3 py-1 rounded cursor-pointer text-sm ${
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
                className="px-3 py-1 rounded bg-gray-200 disabled:opacity-50 cursor-pointer text-sm"
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
    </>
  );
};

export default UsersTable;
