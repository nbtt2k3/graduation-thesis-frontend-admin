import { Editor } from "@tinymce/tinymce-react"

const MyEditor = ({
  value = "<p>Bắt đầu chỉnh sửa mô tả sản phẩm tại đây!</p>",
  onChange,
  disabled = false,
  error,
  placeholder = "Nhập mô tả sản phẩm...",
}) => {
  const apiKey = import.meta.env.VITE_TINYMCE_API_KEY

  const handleEditorChange = (content) => {
    if (onChange) onChange(content)
  }

  if (!apiKey) {
    return (
      <div className="border border-red-300 rounded-sm p-4 bg-red-50">
        <p className="text-red-600 text-sm">
          TinyMCE API key chưa được cấu hình. Vui lòng thêm VITE_TINYMCE_API_KEY vào file .env
        </p>
      </div>
    )
  }

  return (
    <div className="relative">
      <Editor
        apiKey={apiKey}
        value={value}
        disabled={disabled}
        onEditorChange={handleEditorChange}
        init={{
          height: 300,
          menubar: true,
          placeholder: placeholder,
          plugins: [
            "advlist",
            "autolink",
            "lists",
            "link",
            "image",
            "charmap",
            "preview",
            "anchor",
            "searchreplace",
            "visualblocks",
            "code",
            "fullscreen",
            "insertdatetime",
            "media",
            "table",
            "help",
            "wordcount",
            "paste",
            "directionality",
            "nonbreaking",
          ],
          toolbar:
            "undo redo | blocks | " +
            "bold italic forecolor | alignleft aligncenter " +
            "alignright alignjustify | bullist numlist outdent indent | " +
            "removeformat | help",
          content_style:
            'body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; font-size: 14px }',
          branding: false,
          resize: false,
          statusbar: false,
          setup: (editor) => {
            editor.on("init", () => {
              console.log("TinyMCE editor initialized successfully")
            })

            editor.on("LoadContent", () => {
              if (disabled) {
                editor.getBody().setAttribute("contenteditable", false)
              }
            })
          },
          image_advtab: true,
          image_uploadtab: false,
          link_assume_external_targets: true,
          link_context_toolbar: true,
        }}
        onInit={(evt, editor) => {
          if (disabled) {
            editor.getBody().setAttribute("contenteditable", false)
          }
        }}
        onLoadContent={() => {
          console.log("Content loaded")
        }}
      />
      {error?.message && <p className="text-red-500 text-sm mt-1">{error.message}</p>}
    </div>
  )
}

export default MyEditor
