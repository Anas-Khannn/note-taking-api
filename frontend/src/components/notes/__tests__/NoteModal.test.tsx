import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

const createMutateAsync = vi.hoisted(() => vi.fn());
const updateMutateAsync = vi.hoisted(() => vi.fn());

vi.mock("@/hooks/useNotes", () => ({
  useCreateNote: () => ({
    mutateAsync: createMutateAsync,
    isPending: false,
    error: null,
  }),
  useUpdateNote: () => ({
    mutateAsync: updateMutateAsync,
    isPending: false,
    error: null,
  }),
}));

import { NoteModal } from "@/components/notes/NoteModal";
import type { Note } from "@/types/note";

const note: Note = {
  id: "n_1",
  title: "Existing note",
  content: "Existing content",
  status: "ACTIVE",
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
};

function renderCreate(onClose = vi.fn()) {
  return render(<NoteModal open mode="create" onClose={onClose} />);
}

beforeEach(() => {
  createMutateAsync.mockReset();
  updateMutateAsync.mockReset();
  createMutateAsync.mockResolvedValue({});
  updateMutateAsync.mockResolvedValue({});
});

describe("NoteModal validation", () => {
  it("does not submit when the title and content are empty", async () => {
    const user = userEvent.setup();
    renderCreate();

    await user.click(screen.getByRole("button", { name: "Create Note" }));

    expect(await screen.findByText("Note title is required")).toBeInTheDocument();
    expect(screen.getByText("Note content is required")).toBeInTheDocument();
    expect(createMutateAsync).not.toHaveBeenCalled();
  });

  it("rejects whitespace-only title and content", async () => {
    const user = userEvent.setup();
    renderCreate();

    await user.type(screen.getByLabelText("Title"), "   ");
    await user.type(screen.getByLabelText("Content"), "   ");
    await user.click(screen.getByRole("button", { name: "Create Note" }));

    expect(await screen.findByText("Note title is required")).toBeInTheDocument();
    expect(screen.getByText("Note content is required")).toBeInTheDocument();
    expect(createMutateAsync).not.toHaveBeenCalled();
  });

  it("rejects a title longer than the 100-character backend limit", async () => {
    const user = userEvent.setup();
    renderCreate();

    // maxLength=100 blocks typing; set the value programmatically to exercise
    // the length validation path.
    fireEvent.change(screen.getByLabelText("Title"), {
      target: { value: "T".repeat(101) },
    });
    await user.type(screen.getByLabelText("Content"), "Some content");
    await user.click(screen.getByRole("button", { name: "Create Note" }));

    expect(
      await screen.findByText("Note title cannot exceed 100 characters")
    ).toBeInTheDocument();
    expect(createMutateAsync).not.toHaveBeenCalled();
  });

  it("submits a trimmed create payload", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    renderCreate(onClose);

    await user.type(screen.getByLabelText("Title"), "  My title  ");
    await user.type(screen.getByLabelText("Content"), "  My content  ");
    await user.click(screen.getByRole("button", { name: "Create Note" }));

    await waitFor(() => {
      expect(createMutateAsync).toHaveBeenCalledWith({
        title: "My title",
        content: "My content",
        status: "ACTIVE",
      });
    });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("submits an update payload in edit mode", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(
      <NoteModal open mode="edit" note={note} onClose={onClose} />
    );

    await user.clear(screen.getByLabelText("Title"));
    await user.type(screen.getByLabelText("Title"), "  Updated title  ");
    await user.click(screen.getByRole("button", { name: "Save Changes" }));

    await waitFor(() => {
      expect(updateMutateAsync).toHaveBeenCalledWith({
        id: note.id,
        input: {
          title: "Updated title",
          content: note.content,
          status: "ACTIVE",
        },
      });
    });
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
