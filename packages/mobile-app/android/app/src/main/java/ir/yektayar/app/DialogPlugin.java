package ir.yektayar.app;

import android.app.AlertDialog;
import android.content.Context;
import android.content.DialogInterface;
import android.graphics.Typeface;
import android.text.InputType;
import android.view.Gravity;
import android.view.KeyEvent;
import android.view.View;
import android.view.ViewGroup;
import android.view.Window;
import android.view.inputmethod.EditorInfo;
import android.view.inputmethod.InputMethodManager;
import android.widget.Button;
import android.widget.EditText;
import android.widget.ImageView;
import android.widget.LinearLayout;
import android.widget.TextView;

import androidx.core.content.ContextCompat;
import androidx.core.content.res.ResourcesCompat;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "Dialog")
public class DialogPlugin extends Plugin {

    @PluginMethod
    public void alert(PluginCall call) {
        String title = call.getString("title", "");
        String message = call.getString("message", "");
        String icon = call.getString("icon", "info");
        String buttonText = call.getString("buttonText", "OK");

        getActivity().runOnUiThread(() -> {
            AlertDialog.Builder builder = new AlertDialog.Builder(getActivity(), R.style.AlertDialogStyle);
            builder.setIcon(getIconDrawable(icon));
            builder.setTitle(title);
            builder.setMessage(message);
            builder.setPositiveButton(buttonText, (dialog, which) -> {
                JSObject ret = new JSObject();
                ret.put("dismissed", false);
                call.resolve(ret);
            });
            builder.setOnCancelListener(dialog -> {
                JSObject ret = new JSObject();
                ret.put("dismissed", true);
                call.resolve(ret);
            });

            AlertDialog dialog = builder.create();
            dialog.show();
        });
    }

    @PluginMethod
    public void confirm(PluginCall call) {
        String title = call.getString("title", "");
        String message = call.getString("message", "");
        String icon = call.getString("icon", "question");
        String okButtonText = call.getString("okButtonText", "OK");
        String cancelButtonText = call.getString("cancelButtonText", "Cancel");

        getActivity().runOnUiThread(() -> {
            AlertDialog.Builder builder = new AlertDialog.Builder(getActivity(), R.style.AlertDialogStyle);
            builder.setIcon(getIconDrawable(icon));
            builder.setTitle(title);
            builder.setMessage(message);
            builder.setPositiveButton(okButtonText, (dialog, which) -> {
                JSObject ret = new JSObject();
                ret.put("confirmed", true);
                call.resolve(ret);
            });
            builder.setNegativeButton(cancelButtonText, (dialog, which) -> {
                JSObject ret = new JSObject();
                ret.put("confirmed", false);
                call.resolve(ret);
            });
            builder.setOnCancelListener(dialog -> {
                JSObject ret = new JSObject();
                ret.put("confirmed", false);
                call.resolve(ret);
            });

            AlertDialog dialog = builder.create();
            dialog.show();
        });
    }

    @PluginMethod
    public void prompt(PluginCall call) {
        String title = call.getString("title", "");
        String message = call.getString("message", "");
        String icon = call.getString("icon", "question");
        String hint = call.getString("hint", "");
        String defaultValue = call.getString("defaultValue", "");
        String inputType = call.getString("inputType", "text");
        String okButtonText = call.getString("okButtonText", "OK");
        String cancelButtonText = call.getString("cancelButtonText", "Cancel");

        getActivity().runOnUiThread(() -> {
            AlertDialog.Builder builder = new AlertDialog.Builder(getActivity(), R.style.AlertDialogStyle);
            builder.setIcon(getIconDrawable(icon));
            builder.setTitle(title);

            // Create input field
            final EditText input = new EditText(getActivity());
            input.setInputType(getInputType(inputType));
            input.setImeOptions(input.getImeOptions() | EditorInfo.IME_FLAG_FORCE_ASCII);
            input.setImeActionLabel("Done", EditorInfo.IME_ACTION_DONE);
            input.setSingleLine();
            input.setText(defaultValue);
            input.setHint(hint);
            
            // Try to use Sahel font if available
            try {
                Typeface typeface = ResourcesCompat.getFont(getContext(), R.font.sahel);
                if (typeface != null) {
                    input.setTypeface(typeface, Typeface.NORMAL);
                }
            } catch (Exception e) {
                // Font not available, use default
                input.setTypeface(Typeface.DEFAULT, Typeface.NORMAL);
            }
            
            input.setTextSize(16);
            input.setLayoutDirection(View.LAYOUT_DIRECTION_LTR);
            input.setTextDirection(View.TEXT_DIRECTION_LTR);

            // Create layout
            LinearLayout rootLayout = new LinearLayout(getActivity());
            rootLayout.setOrientation(LinearLayout.VERTICAL);
            
            int alertDialogPadding = 64;
            rootLayout.setPadding(alertDialogPadding, 64, alertDialogPadding, 64);

            // Create message TextView
            TextView textView = new TextView(getActivity());
            textView.setText(message);
            textView.setTextColor(ContextCompat.getColor(getContext(), R.color.colorForeground));
            textView.setTextSize(16);
            
            // Try to use Sahel font if available
            try {
                Typeface typeface = ResourcesCompat.getFont(getContext(), R.font.sahel);
                if (typeface != null) {
                    textView.setTypeface(typeface, Typeface.NORMAL);
                }
            } catch (Exception e) {
                // Font not available, use default
                textView.setTypeface(Typeface.DEFAULT, Typeface.NORMAL);
            }

            rootLayout.addView(textView);
            rootLayout.addView(input);

            builder.setView(rootLayout);

            builder.setPositiveButton(okButtonText, null);
            builder.setNegativeButton(cancelButtonText, (dialog, which) -> {
                JSObject ret = new JSObject();
                ret.put("cancelled", true);
                ret.put("value", "");
                call.resolve(ret);
            });
            
            builder.setOnCancelListener(dialog -> {
                JSObject ret = new JSObject();
                ret.put("cancelled", true);
                ret.put("value", "");
                call.resolve(ret);
            });

            AlertDialog dialog = builder.create();

            dialog.setOnShowListener(dialogInterface -> {
                Button button = dialog.getButton(AlertDialog.BUTTON_POSITIVE);
                button.setOnClickListener(v -> {
                    String value = input.getText().toString().trim();
                    JSObject ret = new JSObject();
                    ret.put("cancelled", false);
                    ret.put("value", value);
                    call.resolve(ret);
                    dialog.dismiss();
                });
            });

            input.setOnEditorActionListener((textView1, actionId, keyEvent) -> {
                if (actionId == EditorInfo.IME_ACTION_DONE) {
                    Button button = dialog.getButton(AlertDialog.BUTTON_POSITIVE);
                    button.performClick();
                    return true;
                }
                return false;
            });

            dialog.show();
            
            // Show keyboard
            input.requestFocus();
            input.postDelayed(() -> {
                InputMethodManager imm = (InputMethodManager) getActivity().getSystemService(Context.INPUT_METHOD_SERVICE);
                imm.showSoftInput(input, InputMethodManager.SHOW_IMPLICIT);
            }, 200);
        });
    }

    private int getInputType(String type) {
        switch (type.toLowerCase()) {
            case "number":
                return InputType.TYPE_CLASS_NUMBER;
            case "phone":
                return InputType.TYPE_CLASS_PHONE;
            case "email":
                return InputType.TYPE_TEXT_VARIATION_EMAIL_ADDRESS;
            case "password":
                return InputType.TYPE_CLASS_TEXT | InputType.TYPE_TEXT_VARIATION_PASSWORD;
            case "text":
            default:
                return InputType.TYPE_CLASS_TEXT;
        }
    }

    private int getIconDrawable(String icon) {
        switch (icon.toLowerCase()) {
            case "success":
            case "info":
                return R.drawable.ic_icon_information;
            case "error":
                return R.drawable.ic_icon_error;
            case "warning":
                return R.drawable.ic_icon_warning;
            case "question":
                return R.drawable.ic_icon_question;
            case "wait":
                return R.drawable.ic_icon_wait;
            default:
                return R.drawable.ic_icon_information;
        }
    }
}
