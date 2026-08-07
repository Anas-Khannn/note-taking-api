import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

const noteServiceMock = vi.hoisted(() => ({
  getAll: vi.fn(),
  getOne: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  archive: vi.fn(),
  remove: vi.fn(),
}));

vi.mock("@/services/note.service", () => ({ noteService: noteServiceMock }));

import {
  useCreateNote,
  useDeleteNote,
  useUpdateNote,
} from "@/hooks/useNotes";
import { noteKeys } from "@/hooks/note-keys";

function MutationProbe() {
  const create = useCreateNote();
  const update = useUpdateNote();
  const remove = useDeleteNote();

  return (
    <div>
      <button
        type="button"
        onClick={() => create.mutate({ title: "T", content: "C" })}
      >
        create
      </button>
      <button
        type="button"
        onClick={() =>
          update.mutate({ id: "n_1", input: { title: "T2" } })
        }
      >
        update
      </button>
      <button type="button" onClick={() => remove.mutate("n_1")}>
        remove
      </button>
    </div>
  );
}

function renderProbe() {
  const queryClient = new QueryClient({
    defaultOptions: { mutations: { retry: false } },
  });
  const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");
  const removeSpy = vi.spyOn(queryClient, "removeQueries");
  const view = render(
    <QueryClientProvider client={queryClient}>
      <MutationProbe />
    </QueryClientProvider>
  );
  return { queryClient, invalidateSpy, removeSpy, ...view };
}

beforeEach(() => {
  noteServiceMock.create.mockReset();
  noteServiceMock.update.mockReset();
  noteServiceMock.remove.mockReset();
  noteServiceMock.create.mockResolvedValue({});
  noteServiceMock.update.mockResolvedValue({});
  noteServiceMock.remove.mockResolvedValue(undefined);
});

describe("note mutation cache synchronization", () => {
  it("create invalidates the note lists", async () => {
    const user = userEvent.setup();
    const { invalidateSpy } = renderProbe();

    await user.click(screen.getByRole("button", { name: "create" }));

    await waitFor(() => {
      expect(noteServiceMock.create).toHaveBeenCalledWith({
        title: "T",
        content: "C",
      });
    });
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: noteKeys.lists() });
  });

  it("update invalidates the lists and the updated note detail", async () => {
    const user = userEvent.setup();
    const { invalidateSpy } = renderProbe();

    await user.click(screen.getByRole("button", { name: "update" }));

    await waitFor(() => {
      expect(noteServiceMock.update).toHaveBeenCalledWith("n_1", {
        title: "T2",
      });
    });
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: noteKeys.lists() });
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: noteKeys.detail("n_1"),
    });
  });

  it("delete invalidates the lists and removes the deleted note detail", async () => {
    const user = userEvent.setup();
    const { invalidateSpy, removeSpy } = renderProbe();

    await user.click(screen.getByRole("button", { name: "remove" }));

    await waitFor(() => {
      expect(noteServiceMock.remove).toHaveBeenCalledWith("n_1");
    });
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: noteKeys.lists() });
    expect(removeSpy).toHaveBeenCalledWith({
      queryKey: noteKeys.detail("n_1"),
    });
  });
});
