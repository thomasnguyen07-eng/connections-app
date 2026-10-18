import io

file_path = 'public/organization-quote.html'

with io.open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

start_marker = '<script>'
end_marker = '</script>'

start_idx = content.find(start_marker)
end_idx = content.find(end_marker) + len(end_marker)

if start_idx == -1 or end_idx == -1:
    print('ERROR: Could not find script tags')
    exit(1)

new_script = """<script>
  document.getElementById("send-email-request-btn").addEventListener("click", function() {
    const recipient = "support@connectionsfinder.com";
    const subject = "Bulk Subscription Quote Request";
    const body = "Hello,\n\nI would like to request a bulk quote.\n\nNumber of users: \nPlan type (Monthly/3 Months/6 Months/Yearly): \nOrganization name: \nContact email: \n\nThank you.";

    const mailtoLink = "mailto:" + recipient + "?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(body);
    window.location.href = mailtoLink;

    setTimeout(() => {
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      if (document.hasFocus() && !isMobile) {
        const gmailUrl = "https://mail.google.com/mail/?view=cm&fs=1&to=" + encodeURIComponent(recipient) + "&su=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(body);
        const outlookUrl = "https://outlook.live.com/mail/0/deeplink/compose?to=" + encodeURIComponent(recipient) + "&subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(body);
        const yahooUrl = "https://compose.mail.yahoo.com/?to=" + encodeURIComponent(recipient) + "&subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(body);

        const fallback = document.createElement("div");
        fallback.style.cssText = "position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); z-index: 10001; display: flex; justify-content: center; align-items: center;";
        fallback.innerHTML = \`
          <div style="background: white; padding: 20px; border-radius: 8px; max-width: 90%; width: 480px; box-shadow: 0 4px 12px rgba(0,0,0,0.3); position: relative;">
            <button id="fallback-close" style="position: absolute; top: 10px; right: 10px; background: none; border: none; font-size: 22px; cursor: pointer; color: #666;">&times;</button>
            <h3 style="margin-top: 0; color: #333;">No email app detected</h3>
            <p style="color: #555; font-size: 14px; line-height: 1.5;">
              Your device does not have a default email app installed. Choose one of the options below to send your message:
            </p>
            <div style="display: flex; gap: 10px; margin: 15px 0;">
              <a href="\${gmailUrl}" target="_blank" style="flex:1; padding: 12px; background: #D44638; color: white; text-align: center; text-decoration: none; border-radius: 4px; font-weight: 600;">Open Gmail</a>
              <a href="\${outlookUrl}" target="_blank" style="flex:1; padding: 12px; background: #0072C6; color: white; text-align: center; text-decoration: none; border-radius: 4px; font-weight: 600;">Open Outlook</a>
              <a href="\${yahooUrl}" target="_blank" style="flex:1; padding: 12px; background: #720E9E; color: white; text-align: center; text-decoration: none; border-radius: 4px; font-weight: 600;">Open Yahoo</a>
            </div>
          </div>
        \`;
        document.body.appendChild(fallback);
        document.getElementById("fallback-close").onclick = function() { fallback.remove(); };
        fallback.addEventListener("click", function(e) { if (e.target === fallback) fallback.remove(); });
      }
    }, 800);
  });
</script>"""

new_content = content[:start_idx] + new_script + content[end_idx:]

with io.open(file_path, 'w', encoding='utf-8') as f:
    f.write(new_content)

print('SUCCESS: Script rebuilt')
