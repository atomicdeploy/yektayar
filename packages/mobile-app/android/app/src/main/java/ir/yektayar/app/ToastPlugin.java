package ir.yektayar.app;

import android.content.Context;
import android.view.Gravity;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ImageView;
import android.widget.LinearLayout;
import android.widget.TextView;
import android.widget.Toast;

import androidx.core.content.ContextCompat;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "Toast")
public class ToastPlugin extends Plugin {

    private ImageView lastToastImage;
    private TextView lastToastText;

    @PluginMethod
    public void show(PluginCall call) {
        String message = call.getString("message", "");
        String icon = call.getString("icon", null);
        String duration = call.getString("duration", "short");
        String gravity = call.getString("gravity", "bottom");

        if (message.isEmpty()) {
            call.reject("Message is required");
            return;
        }

        int toastDuration = duration.equals("long") ? Toast.LENGTH_LONG : Toast.LENGTH_SHORT;
        Integer drawableId = getIconDrawable(icon);

        getActivity().runOnUiThread(() -> {
            Toast toast = makeToast(getContext(), message, drawableId, toastDuration);
            
            // Set gravity
            int gravityValue = Gravity.BOTTOM | Gravity.CENTER_HORIZONTAL;
            int yOffset = 50;
            
            if (gravity.equals("top")) {
                gravityValue = Gravity.TOP | Gravity.CENTER_HORIZONTAL;
                yOffset = 50;
            } else if (gravity.equals("center")) {
                gravityValue = Gravity.CENTER;
                yOffset = 0;
            }
            
            toast.setGravity(gravityValue, 0, yOffset);
            toast.show();
            
            call.resolve();
        });
    }

    private Toast makeToast(Context context, String message, Integer drawableId, int duration) {
        final Toast toast = Toast.makeText(context, message, duration);

        LayoutInflater inflater = LayoutInflater.from(context);
        View toastLayout = inflater.inflate(R.layout.toast_layout, null);

        ImageView imageView = toastLayout.findViewById(R.id.imageView);
        if (drawableId == null) {
            imageView.setVisibility(View.GONE);
        } else {
            imageView.setImageResource(drawableId);
        }
        lastToastImage = imageView;

        TextView textView = toastLayout.findViewById(R.id.textView);
        textView.setText(message);
        textView.setMinWidth(120);
        textView.setTextColor(ContextCompat.getColor(context, R.color.colorForeground));
        textView.setGravity(Gravity.START);
        textView.setPadding(0, 0, 30, 0);
        lastToastText = textView;

        toast.setView(toastLayout);

        LinearLayout toastContent = toastLayout.findViewById(R.id.toastContent);

        // RTL support for Persian/Arabic
        String language = context.getResources().getConfiguration().locale.getLanguage();
        if (language.equals("fa") || language.equals("ar")) {
            textView.setGravity(Gravity.END);
            textView.setPadding(30, 0, 0, 0);
        }

        return toast;
    }

    private Integer getIconDrawable(String icon) {
        if (icon == null) return null;
        
        switch (icon.toLowerCase()) {
            case "success":
                return R.drawable.ic_icon_information; // or create ic_icon_success
            case "error":
                return R.drawable.ic_icon_error;
            case "warning":
                return R.drawable.ic_icon_warning;
            case "info":
                return R.drawable.ic_icon_information;
            case "question":
                return R.drawable.ic_icon_question;
            case "wait":
                return R.drawable.ic_icon_wait;
            default:
                return null;
        }
    }
}
